// import mongoose from "mongoose";
// import Unit from "../../models/Unit.js";

// export const create = async (req, res) => {
//     try {
//         const { title, abbreviation, isActive } = req.body;

//         if (!title || !title.trim()) {
//             return res.status(400).json({ message: "Tên đơn vị là bắt buộc" });
//         }

//         const existed = await Unit.findOne({ title: title.trim() });
//         if (existed) {
//             return res.status(400).json({ message: "Đơn vị đã tồn tại" });
//         }

//         const unit = await Unit.create({
//             title: title.trim(),
//             abbreviation: abbreviation?.trim() || "",
//             isActive: isActive !== undefined ? isActive : true,
//         });

//         res.status(201).json({
//             message: "Tạo đơn vị thành công",
//             unit,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// /**
//  * GET all units
//  */
// export const getAll = async (req, res) => {
//     try {
//         const units = await Unit.find().sort({ createdAt: -1 });

//         res.json(units);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// /**
//  * GET unit by ID
//  */
// export const getById = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "ID không hợp lệ" });
//         }

//         const unit = await Unit.findById(id);
//         if (!unit) {
//             return res.status(404).json({ message: "Không tìm thấy đơn vị" });
//         }

//         res.json({ unit });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// /**
//  * UPDATE unit
//  */
// export const update = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { title, abbreviation, isActive } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "ID không hợp lệ" });
//         }

//         const unit = await Unit.findById(id);
//         if (!unit) {
//             return res.status(404).json({ message: "Đơn vị không tồn tại" });
//         }

//         if (title && title.trim() !== unit.title) {
//             const existed = await Unit.findOne({ title: title.trim() });
//             if (existed) {
//                 return res.status(400).json({ message: "Tên đơn vị đã tồn tại" });
//             }
//             unit.title = title.trim();
//         }

//         if (abbreviation !== undefined) {
//             unit.abbreviation = abbreviation.trim();
//         }

//         if (isActive !== undefined) {
//             unit.isActive = isActive;
//         }

//         await unit.save();

//         res.json({
//             message: "Cập nhật đơn vị thành công",
//             unit,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// export const deleteUnit = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "ID không hợp lệ" });
//         }

//         const unit = await Unit.findById(id);
//         if (!unit) {
//             return res.status(404).json({ message: "Không tìm thấy đơn vị" });
//         }

//         unit.isActive = false;
//         await unit.save();

//         res.json({ message: "Ẩn đơn vị thành công" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };