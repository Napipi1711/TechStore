import mongoose from "mongoose";
import Purchase from "../../models/Purchase.js";
import PurchaseDetail from "../../models/PurchaseDetail.js";
import Supplier from "../../models/Supplier.js";
import Branch from "../../models/Branch.js";
import Product from "../../models/Product.js";
import Log from "../../models/Log.js";
import UserBranch from "../../models/userBranches.js";
import StockMovement from "../../models/StockMovement.js";
import Inventory from "../../models/Inventory.js";
import InventoryDetail from "../../models/InventoryDetail.js";
export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      supplierId,
      branchId,
      items,
      note,
    } = req.body;

    const managerId = req.user?.id;

    //  VALIDATE
    if (!supplierId || !branchId || !items || items.length === 0) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!managerId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    //VALIDATE ITEMS
    for (const item of items) {
      if (
        !item.productId ||
        Number(item.quantity) <= 0 ||
        Number(item.costPrice) <= 0
      ) {
        return res.status(400).json({
          message: "Invalid item data",
        });
      }
    }

    //  CREATE PURCHASE HEADER
    const purchase = await Purchase.create(
      [
        {
          supplierId,
          branchId,
          managerId,
          note: note || "",
          status: "pending",
        },
      ],
      { session }
    );

    const purchaseId = purchase[0]._id;

    //  CREATE DETAILS
    const purchaseDetails = items.map((item) => ({
      purchaseId,
      productId: item.productId,
      quantity: Number(item.quantity),
      costPrice: Number(item.costPrice),
      lineTotal: Number(item.quantity) * Number(item.costPrice),
      note: item.note || "",
    }));

    await PurchaseDetail.insertMany(purchaseDetails, { session });

    // 🔥 CALCULATE TOTAL
    const totalAmount = purchaseDetails.reduce(
      (sum, item) => sum + item.lineTotal,
      0
    );

    await Purchase.findByIdAndUpdate(
      purchaseId,
      { totalAmount },
      { session }
    );

    await session.commitTransaction();

    // 🔥 POPULATE RESPONSE
    const populatedPurchase = await Purchase.findById(purchaseId)
      .populate("supplierId", "name phone email")
      .populate("branchId", "name code")
      .populate("managerId", "name email role");

    const details = await PurchaseDetail.find({ purchaseId })
      .populate("productId", "name sku");

    // 🔹 LOG
    try {
      await Log.create({
        level: "INFO",
        actorId: managerId,
        branchId,
        action: "CREATE_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchaseId,
        message: "Manager created purchase order",
        details: {
          supplierId,
          totalAmount,
          itemCount: items.length,
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (err) {
      console.error("Log error:", err);
    }

    return res.status(201).json({
      message: "Purchase created successfully",
      data: {
        purchase: populatedPurchase,
        items: details,
      },
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("createPurchase error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  } finally {
    session.endSession();
  }
};

// Lấy danh sách phiếu nhập
export const getAllPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, fromDate, toDate } = req.query;

    // 🔥 tìm branch của user
    const userBranch = await UserBranch.findOne({ userId });

    if (!userBranch) {
      return res.status(403).json({
        message: "User is not assigned to any branch",
      });
    }

    const filter = {
      branchId: userBranch.branchId,
    };

    // 🔥 filter status
    if (status) {
      filter.status = status;
    }

    // 🔥 filter theo ngày
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        filter.createdAt.$lte = new Date(toDate);
      }
    }

    // 🔥 lấy purchase (header)
    const purchases = await Purchase.find(filter)
      .populate("supplierId", "name phone email")
      .populate("branchId", "name code")
      .populate("managerId", "name email role")
      .sort({ createdAt: -1 });

    // 🔥 lấy tất cả purchaseId
    const purchaseIds = purchases.map((p) => p._id);

    // 🔥 lấy details theo purchaseId
    const details = await PurchaseDetail.find({
      purchaseId: { $in: purchaseIds },
    }).populate("productId", "name sku");

    // 🔥 group details theo purchase
    const mapDetails = {};
    details.forEach((d) => {
      if (!mapDetails[d.purchaseId]) {
        mapDetails[d.purchaseId] = [];
      }
      mapDetails[d.purchaseId].push(d);
    });

    // 🔥 merge lại
    const result = purchases.map((p) => ({
      ...p.toObject(),
      items: mapDetails[p._id] || [],
    }));

    return res.status(200).json({
      message: "Purchases fetched successfully",
      data: result,
    });

  } catch (error) {
    console.error("getAllPurchases error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Lấy chi tiết 1 phiếu nhập (Details)
export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔥 Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid purchase id" });
    }

    // 🔥 Lấy purchase (header)
    const purchase = await Purchase.findById(id)
      .populate("supplierId", "name phone email address")
      .populate("branchId", "name code address")
      .populate("managerId", "name email role phone");

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // 🔥 Lấy chi tiết items
    const details = await PurchaseDetail.find({ purchaseId: id })
      .populate("productId", "name sku price costPrice unit")
      .select(
        "productId quantity receivedQty returnedQty costPrice status confirmDate returnDate"
      );

    // 🔥 Lấy inventoryDetails của từng sản phẩm
    const productIds = details.map((d) => d.productId._id);
    const inventoryDetails = await InventoryDetail.find({
      branchId: purchase.branchId,
      productId: { $in: productIds },
    }).select(
      "productId lotCode originalQty remainingQty status costPrice receivedAt"
    );

    // 🔹 Map inventoryDetails vào từng item + confirmDate & returnDate + remainingToReturn
    const items = details.map((item) => {
      const itemInventoryDetails = inventoryDetails
        .filter(
          (inv) => inv.productId.toString() === item.productId._id.toString()
        )
        .map((inv) => ({
          lotCode: inv.lotCode,
          originalQty: inv.originalQty,
          remainingQty: inv.remainingQty,
          status: inv.status,
          costPrice: inv.costPrice,
          receivedAt: inv.receivedAt,
        }));

      const remainingToReturn = item.quantity - (item.returnedQty || 0);

      return {
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        receivedQty: item.receivedQty,
        returnedQty: item.returnedQty || 0, // số lượng đã trả
        remainingToReturn,                  // số lượng còn lại chưa trả
        costPrice: item.costPrice,
        status: item.status,
        confirmDate: item.confirmDate || null,
        returnDate: item.returnDate || null,
        inventoryDetails: itemInventoryDetails,
      };
    });

    return res.status(200).json({
      message: "Purchase fetched successfully",
      data: {
        ...purchase.toObject(),
        items,
      },
    });
  } catch (error) {
    console.error("getPurchaseById error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Cập nhật phiếu nhập khi còn pending
export const updatePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { supplierId, items, note } = req.body;

    const purchase = await Purchase.findById(id).session(session);

    if (!purchase) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (purchase.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Only pending purchases can be updated",
      });
    }

    // update header
    if (supplierId) purchase.supplierId = supplierId;
    if (note !== undefined) purchase.note = note;

    await purchase.save({ session });

    // 🔥 update items
    if (items && items.length > 0) {
      await PurchaseDetail.deleteMany({ purchaseId: id }).session(session);

      const newDetails = items.map((i) => ({
        purchaseId: id,
        productId: i.productId,
        quantity: i.quantity,
        costPrice: i.costPrice,
        lineTotal: i.quantity * i.costPrice,
      }));

      await PurchaseDetail.insertMany(newDetails, { session });

      // update total
      const totalAmount = newDetails.reduce(
        (sum, i) => sum + i.lineTotal,
        0
      );

      purchase.totalAmount = totalAmount;
      await purchase.save({ session });
    }

    await session.commitTransaction();

    return res.status(200).json({
      message: "Purchase updated successfully",
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Server error" });
  } finally {
    session.endSession();
  }
};

// Xác nhận đơn nhập hàng -> cộng kho + tạo stock movement
export const confirmPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const managerId = req.user?.id;

    // 1️⃣ Lấy purchase
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (purchase.status !== "pending") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Purchase not pending" });
    }

    if (!purchase.branchId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Purchase branchId missing" });
    }

    // 2️⃣ Lấy chi tiết
    const details = await PurchaseDetail.find({ purchaseId: id }).session(session);
    if (!details || details.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "No purchase details found" });
    }

    const now = new Date();

    // 3️⃣ Cập nhật inventory + InventoryDetail + StockMovement + confirmDate
    for (const item of details) {
      if (!item.productId || item.quantity <= 0 || item.costPrice == null) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Invalid item ${item._id}` });
      }

      // 🔹 Inventory tổng
      let inventory = await Inventory.findOne({
        branchId: purchase.branchId,
        productId: item.productId,
      }).session(session);

      if (!inventory) {
        inventory = new Inventory({
          branchId: purchase.branchId,
          productId: item.productId,
          quantity: 0,
          avgCost: 0,
          lastPurchasePrice: 0,
        });
      }

      const prevQty = inventory.quantity || 0;
      const prevAvgCost = inventory.avgCost || 0;

      inventory.quantity += item.quantity;
      inventory.lastPurchasePrice = item.costPrice;
      inventory.avgCost =
        (prevAvgCost * prevQty + item.costPrice * item.quantity) /
        (prevQty + item.quantity);

      await inventory.save({ session });

      // 🔹 InventoryDetail
      await InventoryDetail.create(
        [
          {
            inventoryId: inventory._id,
            branchId: purchase.branchId,
            purchaseId: purchase._id,
            purchaseItemId: item._id,
            productId: item.productId,
            originalQty: item.quantity,
            remainingQty: item.quantity,
            costPrice: item.costPrice,
            receivedAt: now,
          },
        ],
        { session }
      );

      // 🔹 StockMovement
      await StockMovement.create(
        [
          {
            productId: item.productId,
            branchId: purchase.branchId,
            quantity: item.quantity,
            type: "in",
            source: "purchase",
            sourceId: purchase._id,
            unitCost: item.costPrice,
            totalCost: item.quantity * item.costPrice,
          },
        ],
        { session }
      );

      // 🔹 Update receivedQty + confirmDate
      item.receivedQty = item.quantity;
      item.confirmDate = now;
      await item.save({ session });
    }

    // 4️⃣ Confirm purchase
    purchase.status = "confirmed";
    purchase.confirmedAt = now;
    await purchase.save({ session });

    // 🔹 LOG SUCCESS
    await Log.create({
      level: "INFO",
      actorId: managerId,
      branchId: purchase.branchId,
      action: "CONFIRM_PURCHASE",
      targetType: "PURCHASE",
      targetId: purchase._id,
      message: "Purchase confirmed successfully",
      details: {
        itemCount: details.length,
        totalQuantity: details.reduce((sum, i) => sum + i.quantity, 0),
      },
      status: "SUCCESS",
      ip: req.ip,
      device: req.headers["user-agent"],
    });

    await session.commitTransaction();
    return res.status(200).json({ message: "Purchase confirmed successfully" });
  } catch (err) {
    console.error("Confirm purchase error:", err);
    await session.abortTransaction();
    return res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    session.endSession();
  }
};


// Hủy phiếu nhập
export const cancelPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!managerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (purchase.status === "confirmed") {
      return res.status(400).json({
        message: "Confirmed purchase cannot be cancelled",
      });
    }

    if (purchase.status === "cancelled") {
      return res.status(400).json({
        message: "Already cancelled",
      });
    }

    purchase.status = "cancelled";
    await purchase.save();

    // log
    try {
      await Log.create({
        actorId: managerId,
        branchId,
        action: "CANCEL_PURCHASE",
        targetType: "PURCHASE",
        targetId: id,
        status: "SUCCESS",
      });
    } catch (err) { }

    return res.status(200).json({
      message: "Cancelled successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Xóa phiếu nhập khi còn pending/cancelled
export const deletePurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const managerId = req.user?.id;
    const branchId = req.user?.branchId;

    if (!managerId) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Unauthorized" });
    }

    const purchase = await Purchase.findById(id).session(session);

    if (!purchase) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Purchase not found" });
    }

    if (purchase.status === "confirmed") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Cannot delete confirmed purchase" });
    }

    // 🔹 delete details trước
    await PurchaseDetail.deleteMany({ purchaseId: id }).session(session);

    // 🔹 delete header
    await Purchase.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    // 🔹 LOG SUCCESS (chỉ khi xóa thành công)
    try {
      await Log.create({
        level: "WARN",
        actorId: managerId,
        branchId,
        action: "DELETE_PURCHASE",
        targetType: "PURCHASE",
        targetId: id,
        message: "Purchase deleted successfully",
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (err) {
      console.error("Log error:", err);
    }

    return res.status(200).json({ message: "Deleted successfully" });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};
export const returnPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { id } = req.params; // purchaseId
    const managerId = req.user?.id;

    const purchase = await Purchase.findById(id).session(session);
    if (!purchase || purchase.status !== "confirmed") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid purchase" });
    }

    const details = await PurchaseDetail.find({ purchaseId: id }).session(session);
    const now = new Date();

    for (const item of details) {
      const inventoryLots = await InventoryDetail.find({
        branchId: purchase.branchId,
        productId: item.productId,
        status: { $in: ["open", "depleted"] },
      }).sort({ receivedAt: 1 }).session(session);

      if (inventoryLots.some(lot => lot.remainingQty < lot.originalQty)) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Cannot return product ${item.productId}, part of lot already sold`
        });
      }

      let totalReturnedQty = 0;
      let qtyToReturn = item.quantity;

      for (const lot of inventoryLots) {
        if (qtyToReturn <= 0) break;

        const deduct = Math.min(lot.remainingQty, qtyToReturn);
        lot.remainingQty -= deduct;
        if (lot.remainingQty === 0) lot.status = "returned";
        await lot.save({ session });

        const inventory = await Inventory.findOne({
          branchId: purchase.branchId,
          productId: item.productId,
        }).session(session);

        if (!inventory) {
          await session.abortTransaction();
          return res.status(400).json({ message: "Inventory not found" });
        }

        inventory.quantity -= deduct;
        if (inventory.quantity < 0) inventory.quantity = 0;
        await inventory.save({ session });

        await StockMovement.create([{
          productId: item.productId,
          branchId: purchase.branchId,
          lotId: lot._id,
          quantity: deduct,
          type: "out",
          source: "return",
          sourceId: purchase._id,
          unitCost: lot.costPrice,
          totalCost: deduct * lot.costPrice,
          note: "Return from purchase",
        }], { session });

        totalReturnedQty += deduct;
        qtyToReturn -= deduct;
      }

      if (totalReturnedQty > 0) {
        item.returnedQty = totalReturnedQty;
        item.returnDate = now;
        await item.save({ session });
      }
    }

    purchase.status = "returned";
    purchase.returnedAt = now;
    await purchase.save({ session });

    await session.commitTransaction();

    // 🔹 LOG SUCCESS (chỉ khi return thành công)
    try {
      await Log.create({
        level: "WARN",
        actorId: managerId,
        branchId: purchase.branchId,
        action: "RETURN_PURCHASE",
        targetType: "PURCHASE",
        targetId: purchase._id,
        message: "Purchase returned successfully",
        details: {
          itemCount: details.length,
          totalReturned: details.reduce((sum, i) => sum + (i.returnedQty || 0), 0)
        },
        status: "SUCCESS",
        ip: req.ip,
        device: req.headers["user-agent"],
      });
    } catch (err) {
      console.error("Log error:", err);
    }

    return res.status(200).json({ message: "Purchase returned successfully" });

  } catch (err) {
    console.error("Return purchase error:", err);
    await session.abortTransaction();
    return res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    session.endSession();
  }
};
