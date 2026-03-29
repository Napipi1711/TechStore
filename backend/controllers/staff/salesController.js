import QRCode from "qrcode";
import Sale from "../../models/Sale.js";
import SaleDetail from "../../models/SaleDetail.js";
import Inventory from "../../models/Inventory.js";
import InventoryDetail from "../../models/InventoryDetail.js";
import StockMovement from "../../models/StockMovement.js";
import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Log from "../../models/Log.js";
import Customer from "../../models/Customer.js";
// Sinh mã đơn hàng tự động
const generateSaleCode = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000);
    return `SALE-${dateStr}-${randomStr}`;
};

export const checkoutPOS = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // ===== DEBUG: xem dữ liệu UI gửi lên =====
        console.log("==== Checkout POS Request Body ====");
        console.log(req.body);
        console.log("===================================");

        const { items, paymentMethod, customerId } = req.body;
        const staffId = req.user.id;
        const branchId = req.user.branchId;

        if (!items || items.length === 0) throw new Error("Cart empty");

        // ===== XỬ LÝ KHÁCH HÀNG =====
        if (!customerId) {
            throw new Error("CustomerId is required. Please select a customer before checkout.");
        }

        const customer = await Customer.findById(customerId).session(session);
        if (!customer) throw new Error("Customer not found");

        // ===== CREATE SALE =====
        const sale = await Sale.create([{
            saleCode: generateSaleCode(),
            branchId,
            staffId,
            customerId: customer._id,
            totalCostAmount: 0,
            totalProfitAmount: 0,
            paymentMethod,
            status: paymentMethod === "qr" ? "pending" : "paid",
            paidAt: paymentMethod === "qr" ? null : new Date(),
        }], { session });

        const saleId = sale[0]._id;
        let grandTotal = 0;
        let totalCostAmount = 0;
        const saleDetailsData = [];

        console.log("Processing items:", items);

        // ===== LOOP ITEMS =====
        for (const item of items) {
            const quantity = item.qty || item.quantity;
            const product = await Product.findById(item.productId).session(session);
            if (!product) throw new Error("Product not found");
            const price = product.price;

            const lots = await InventoryDetail.find({
                productId: item.productId,
                branchId,
                remainingQty: { $gt: 0 },
                status: "open"
            }).sort({ receivedAt: 1 }).session(session);

            let qtyToDeduct = quantity;
            let costAmount = 0;

            for (const lot of lots) {
                if (qtyToDeduct <= 0) break;
                const takeQty = Math.min(lot.remainingQty, qtyToDeduct);
                costAmount += takeQty * lot.costPrice;
                lot.remainingQty -= takeQty;
                if (lot.remainingQty === 0) lot.status = "depleted";
                await lot.save({ session });
                qtyToDeduct -= takeQty;
            }

            if (qtyToDeduct > 0) throw new Error(`Not enough stock for product ${item.productId}`);

            const lineTotal = quantity * price;
            const profitAmount = lineTotal - costAmount;

            saleDetailsData.push({
                saleId,
                productId: item.productId,
                quantity,
                price,
                lineTotal,
                costAmount,
                profitAmount,
            });

            grandTotal += lineTotal;
            totalCostAmount += costAmount;

            const inv = await Inventory.findOne({ productId: item.productId, branchId }).session(session);
            if (!inv || inv.quantity < quantity) throw new Error(`Inventory mismatch for product ${item.productId}`);
            inv.quantity -= quantity;
            await inv.save({ session });

            await StockMovement.create([{
                productId: item.productId,
                branchId,
                quantity,
                type: "out",
                source: "sale",
                unitCost: costAmount / quantity,
                totalCost: costAmount,
                note: `Sale ${saleId}`,
            }], { session });
        }

        await SaleDetail.insertMany(saleDetailsData, { session });

        sale[0].totalCostAmount = totalCostAmount;
        sale[0].totalProfitAmount = grandTotal - totalCostAmount;
        await sale[0].save({ session });

        await session.commitTransaction();

        // 🔹 LOG SUCCESS
        try {
            await Log.create({
                level: "INFO",
                actorId: staffId,
                branchId,
                action: "SALE_COMPLETED",
                targetType: "SALE",
                targetId: saleId,
                message: "POS checkout completed successfully",
                details: {
                    items: items.length,
                    totalAmount: grandTotal,
                    customerId: customer._id
                },
                status: "SUCCESS",
                ip: req.ip,
                device: req.headers["user-agent"]
            });
        } catch (err) {
            console.error("Log error:", err);
        }

        if (paymentMethod === "qr") {
            const BASE_URL = process.env.BASE_URL;
            const qrContent = `${BASE_URL}/api/staff/pos/confirm-qr/${saleId}`;
            const qrImage = await QRCode.toDataURL(qrContent);
            console.log("QR URL:", qrContent);
            return res.json({ success: true, paymentMethod: "qr", saleId, qr: qrImage, amount: grandTotal, customerId: customer._id });
        }

        return res.json({ success: true, saleId, total: grandTotal, paymentMethod, customerId: customer._id });
    } catch (error) {
        await session.abortTransaction();
        console.error("Checkout POS Error:", error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

export const confirmQRPayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { saleId } = req.params;
        const sale = await Sale.findById(saleId).session(session);
        if (!sale) throw new Error("Sale not found");

        if (sale.status === "paid") {
            await session.commitTransaction();
            return res.send("Already paid");
        }

        const saleDetails = await SaleDetail.find({ saleId }).session(session);

        for (const detail of saleDetails) {
            const inv = await Inventory.findOne({ productId: detail.productId, branchId: sale.branchId }).session(session);
            if (!inv || inv.quantity < detail.quantity) throw new Error(`Not enough stock for product ${detail.productId}`);
        }

        for (const detail of saleDetails) {
            let qtyToDeduct = detail.quantity;
            const lots = await InventoryDetail.find({ productId: detail.productId, branchId: sale.branchId, remainingQty: { $gt: 0 }, status: "open" }).sort({ receivedAt: 1 }).session(session);

            for (const lot of lots) {
                if (qtyToDeduct <= 0) break;
                const takeQty = Math.min(lot.remainingQty, qtyToDeduct);
                lot.remainingQty -= takeQty;
                if (lot.remainingQty === 0) lot.status = "depleted";
                await lot.save({ session });
                qtyToDeduct -= takeQty;
            }

            const inv = await Inventory.findOne({ productId: detail.productId, branchId: sale.branchId }).session(session);
            inv.quantity -= detail.quantity;
            await inv.save({ session });

            await StockMovement.create([{
                productId: detail.productId,
                branchId: sale.branchId,
                quantity: detail.quantity,
                type: "out",
                source: "sale",
                unitCost: detail.costAmount / detail.quantity,
                totalCost: detail.costAmount,
                note: `Sale ${saleId} - QR`,
            }], { session });
        }

        sale.status = "paid";
        sale.paidAt = new Date();
        await sale.save({ session });

        await session.commitTransaction();

        // 🔹 LOG SUCCESS
        try {
            await Log.create({
                level: "INFO",
                actorId: sale.staffId,
                branchId: sale.branchId,
                action: "QR_PAYMENT_CONFIRMED",
                targetType: "SALE",
                targetId: saleId,
                message: "QR payment confirmed successfully",
                details: {
                    totalAmount: sale.totalCostAmount + sale.totalProfitAmount
                },
                status: "SUCCESS",
                ip: req.ip,
                device: req.headers["user-agent"]
            });
        } catch (err) {
            console.error("Log error:", err);
        }

        res.send(`<h2>Thanh toán thành công</h2><p>Bạn có thể đóng trang này</p>`);

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.status(500).send(error.message);
    } finally {
        session.endSession();
    }
};

export const getSaleStatus = async (req, res) => {
    try {
        const { saleId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).json({ message: "Invalid saleId" });
        }

        const sale = await Sale.findById(saleId).select("status paidAt saleCode totalProfitAmount totalCostAmount");
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        res.json({
            success: true,
            saleId: sale._id,
            saleCode: sale.saleCode,
            status: sale.status,
            paidAt: sale.paidAt,
            totalProfitAmount: sale.totalProfitAmount,
            totalCostAmount: sale.totalCostAmount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const Details = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid productId" });
        }

        let saleDetails = await SaleDetail.find({ productId })
            .populate({
                path: "saleId",
                select: "saleCode paymentMethod status paidAt createdAt staffId customerId",
                populate: [
                    { path: "staffId", select: "name" },
                    { path: "customerId", select: "name phone" }
                ]
            })
            .sort({ createdAt: -1 })
            .lean();

        // lọc bỏ những record không có saleId
        saleDetails = saleDetails.filter(item => item.saleId);

        // ===== PAGINATION =====
        const startIndex = (page - 1) * limit;
        const paginated = saleDetails.slice(startIndex, startIndex + Number(limit));

        // ===== FORMAT KẾT QUẢ =====
        const result = paginated.map(item => ({
            _id: item._id,
            saleId: item.saleId._id,
            saleCode: item.saleId.saleCode,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.lineTotal,
            costAmount: item.costAmount,
            profitAmount: item.profitAmount,
            paymentMethod: item.saleId.paymentMethod,
            status: item.saleId.status,
            staffName: item.saleId.staffId?.name || "Unknown",
            staffId: item.saleId.staffId?._id,
            customerName: item.saleId.customerId?.name || "Walk-in",
            customerPhone: item.saleId.customerId?.phone || "",
            createdAt: item.saleId.createdAt,
            paidAt: item.saleId.paidAt
        }));

        // ===== TỔNG SỐ LƯỢNG BÁN =====
        const totalQuantity = saleDetails.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            success: true,
            totalRecords: saleDetails.length,
            totalQuantity,
            page: Number(page),
            totalPages: Math.ceil(saleDetails.length / limit),
            data: result
        });

    } catch (error) {
        console.error("DETAILS ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};
export const viewHistory = async (req, res) => {
    try {
        // staffId lấy từ query hoặc token
        const staffId = req.query.staffId || req.user.id;
        const { date } = req.query;

        const filter = { staffId };

        // filter theo ngày
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);

            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            filter.createdAt = { $gte: start, $lte: end };
        }

        // ===== GET SALES =====
        const sales = await Sale.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        if (!sales.length) {
            return res.json({
                success: true,
                totalSales: 0,
                totalRevenue: 0,
                data: []
            });
        }

        const saleIds = sales.map(s => s._id);

        // ===== GET SALE DETAILS =====
        const saleDetails = await SaleDetail.find({ saleId: { $in: saleIds } })
            .populate({
                path: "saleId",
                select: "saleCode paymentMethod status paidAt createdAt customerId staffId",
                populate: [
                    { path: "customerId", select: "name phone" },
                    { path: "staffId", select: "name" }
                ]
            })
            .populate({
                path: "productId",
                select: "name price"
            })
            .lean();

        // ===== GROUP BY SALE =====
        const grouped = {};

        saleDetails.forEach((detail) => {
            const saleId = detail.saleId?._id.toString();

            if (!grouped[saleId]) {
                grouped[saleId] = {
                    saleId,
                    saleCode: detail.saleId?.saleCode,

                    products: [],

                    totalAmount: 0,

                    paymentMethod: detail.saleId?.paymentMethod,
                    status: detail.saleId?.status,

                    createdAt: detail.saleId?.createdAt,
                    paidAt: detail.saleId?.paidAt,

                    customerName: detail.saleId?.customerId?.name ?? "Walk-in",
                    customerPhone: detail.saleId?.customerId?.phone ?? "",

                    staffId: detail.saleId?.staffId?._id ?? staffId,
                    staffName: detail.saleId?.staffId?.name ?? "Unknown",
                };
            }

            const lineTotal = detail.lineTotal ?? (detail.quantity * detail.price);

            grouped[saleId].products.push({
                productId: detail.productId?._id,
                productName: detail.productId?.name ?? "Unknown Product",
                quantity: detail.quantity,
                price: detail.price,
                lineTotal
            });

            grouped[saleId].totalAmount += lineTotal;
        });

        const data = Object.values(grouped);

        // ===== TOTAL REVENUE =====
        const totalRevenue = data.reduce((sum, sale) => sum + sale.totalAmount, 0);

        res.json({
            success: true,
            totalSales: data.length,
            totalRevenue,
            data
        });

    } catch (error) {
        console.error("VIEW STAFF HISTORY ERROR:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
