import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import cloudinary from "../../ultis/cloudinary.js";
import mongoose from "mongoose";
import Inventory from "../../models/Inventory.js";

export const create = async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      description,
      categoryId,
      brandId,
      unit,
      isActive,
    } = req.body;

    // validate Category
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Category ID không hợp lệ" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    // check SKU
    const existed = await Product.findOne({ sku });
    if (existed) {
      return res.status(400).json({ message: "SKU đã tồn tại" });
    }

    // validate Brand
    if (brandId && !mongoose.Types.ObjectId.isValid(brandId)) {
      return res.status(400).json({ message: "Brand ID không hợp lệ" });
    }

    // upload images
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: "products",
            resource_type: "image",
          }
        );
        images.push(uploadResult.secure_url);
      }
    }

    const product = await Product.create({
      name,
      sku,
      price,
      description,
      images,
      categoryId,
      brandId,
      unit,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: "Tạo sản phẩm thành công",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};  

/**
 * GET all products
 */
export const getAll = async (req, res) => {
  try {
    const products = await Product.aggregate([
      // JOIN inventory
      {
        $lookup: {
          from: "inventories",
          localField: "_id",
          foreignField: "productId",
          as: "inventory",
        },
      },

      // tính tổng quantity
      {
        $addFields: {
          quantity: {
            $ifNull: [{ $sum: "$inventory.quantity" }, 0],
          },
        },
      },

      // populate category
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryId",
        },
      },
      { $unwind: { path: "$categoryId", preserveNullAndEmptyArrays: true } },

      // populate brand
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandId",
        },
      },
      { $unwind: { path: "$brandId", preserveNullAndEmptyArrays: true } },

      // sort theo update mới nhất
      { $sort: { updatedAt: -1 } },

      // bỏ inventory raw
      {
        $project: {
          inventory: 0,
        },
      },
    ]);

    res.json({
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET product by ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Product id không hợp lệ" });
    }

    const product = await Product.findById(id)
      .populate("categoryId")
      .populate("brandId");

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // lấy tồn kho
    const inventory = await Inventory.findOne({ productId: id });

    res.status(200).json({
      ...product.toObject(),
      stock: inventory ? inventory.quantity : 0,
    });

  } catch (error) {
    console.error(" getById error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE product
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Product id không hợp lệ" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const body = req.body;

    /* ===== UPDATE PRODUCT ===== */
    if ("name" in body) product.name = body.name;
    if ("sku" in body) product.sku = body.sku;
    if ("barcode" in body) product.barcode = body.barcode;
    if ("price" in body) product.price = Number(body.price);

    if ("description" in body) product.description = body.description;
    if ("categoryId" in body) product.categoryId = body.categoryId;
    if ("brandId" in body) product.brandId = body.brandId;
    if ("unit" in body) product.unit = body.unit;

    if ("isActive" in body) {
      product.isActive = body.isActive === "true" || body.isActive === true;
    }

    /* ===== UPDATE IMAGES (NẾU CÓ FILE MỚI) ===== */
    if (req.files && req.files.length > 0) {
      const images = [];
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "products" }
        );
        images.push(uploadResult.secure_url);
      }
      product.images = images;
    }

    await product.save();

    /* ===== UPDATE INVENTORY ===== */
    if ("stock" in body) {
      const quantity = Number(body.stock);
      if (Number.isNaN(quantity)) {
        return res.status(400).json({ message: "Stock không hợp lệ" });
      }

      await Inventory.findOneAndUpdate(
        { productId: id },
        { $set: { quantity } },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công",
      data: product
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE product (soft delete)
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: "Ẩn sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};