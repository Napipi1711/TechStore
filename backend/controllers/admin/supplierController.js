import mongoose from "mongoose";
import Supplier from "../../models/Supplier.js";

// Lấy danh sách nhà cung cấp
export const getSuppliers = async (req, res) => {
    try {
        const { name } = req.query;

        const filter = name
            ? { name: { $regex: name, $options: "i" } }
            : {};

        const suppliers = await Supplier.find(filter);
        res.status(200).json(suppliers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách nhà cung cấp" });
    }
};
// Lấy chi tiết 1 nhà cung cấp
export const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const supplier = await Supplier.findById(id);

        if (!supplier) {
            return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
        }

        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy chi tiết nhà cung cấp" });
    }
};

// Tạo nhà cung cấp mới
export const create = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const newSupplier = new Supplier({ name, phone, email, address });
        await newSupplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo nhà cung cấp" });
    }
};

// Cập nhật thông tin nhà cung cấp
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, isActive } = req.body;
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id,
            { name, phone, email, address, isActive },
            { new: true }
        );
        if (!updatedSupplier) {
            return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
        }
        res.status(200).json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật nhà cung cấp" });
    }
};

// Xóa nhà cung cấp
export const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSupplier = await Supplier.findByIdAndDelete(id);
        if (!deletedSupplier) {
            return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
        }
        res.status(200).json({ message: "Xóa nhà cung cấp thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa nhà cung cấp" });
    }
};
