import Product from "../../models/Product.js";
import mongoose from "mongoose";
import Inventory from "../../models/Inventory.js";
import User from "../../models/User.js";
import UserBranch from "../../models/UserBranches.js";
//manager
export const getAllProducts = async (req, res) => {
  try {

    const branchId = req.user.branchId;

    const products = await Product.aggregate([

      {
        $match: { isActive: true }
      },

      {
        $lookup: {
          from: "inventories",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$productId", "$$productId"] },
                    { $eq: ["$branchId", new mongoose.Types.ObjectId(branchId)] }
                  ]
                }
              }
            }
          ],
          as: "inventory"
        }
      },

      {
        $addFields: {
          quantity: {
            $ifNull: [{ $sum: "$inventory.quantity" }, 0]
          }
        }
      },

      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId"
        }
      },
      { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandId"
        }
      },
      { $unwind: { path: "$brandId", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          inventory: 0
        }
      }

    ]);

    res.json({
      total: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};