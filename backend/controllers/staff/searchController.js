import mongoose from "mongoose";
import Inventory from "../../models/Inventory.js";
import Branch from "../../models/Branch.js";
export const searchs = async (req, res) => {
  try {
    // console.log("USER:", req.user);
    // console.log("QUERY:", req.query);
    // console.log("KEYWORD:", req.query.keyword);
    // console.log("BRANCH ID:", req.user?.branchId); // xem branchId

    const keyword = req.query.keyword || "";
    const branchId = req.user.branchId;

    const result = await Inventory.aggregate([
      {
        $match: {
          branchId: new mongoose.Types.ObjectId(branchId),
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: "$product" },

      {
        $match: {
          "product.name": { $regex: keyword, $options: "i" },
          "product.isActive": true,
        },
      },

      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          sku: "$product.sku",
          barcode: "$product.barcode",
          price: "$product.price",
          quantity: "$quantity",
          image: { $arrayElemAt: ["$product.images", 0] },
        },
      },

      { $limit: 20 },
    ]);

    res.json(result);
  } catch (err) {
    console.error("FAST LOOKUP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};