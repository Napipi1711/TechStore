import mongoose from "mongoose";
import Category from "../../models/Category.js";

// Create a new category
export const create = async (req, res) => {
    try {
    const { name, description } = req.body;

   
    const existed = await Category.findOne({ name });
    if (existed) {
      return res.status(400).json({ message: "Category đã tồn tại" });
    }

    const category = await Category.create({
      name,
      description,
    });

    res.status(201).json({
      message: "Tạo category thành công",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAll = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ createdAt: -1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.json({
      message: "Cập nhật category thành công",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category không tồn tại" });
    }

    res.json({ message: "Xóa category thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};