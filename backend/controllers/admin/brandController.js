import Brand from "../../models/Brand.js";
import cloudinary from "../../ultis/cloudinary.js";
import slugify from "slugify";

export const createBrand = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const exists = await Brand.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Brand đã tồn tại" });
    }

    const slug = slugify(name, { lower: true, strict: true });

    let logo = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "brands",
          resource_type: "image",
        }
      );
      logo = uploadResult.secure_url;
    }

    const brand = await Brand.create({
      name,
      slug,
      description: description || "",
      logo,
      isActive: isActive ?? true,
    });

    res.status(201).json({
      message: "Tạo brand thành công",
      brand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listBrands = async (req, res) => {
  try {
    const { name, code, isActive } = req.query;

    // Tạo object filter
    const filter = {};
    if (name) filter.name = { $regex: name, $options: "i" }; // tìm kiếm không phân biệt hoa thường
    if (code) filter.code = code;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const brands = await Brand.find(filter).sort({ createdAt: -1 });

    res.json({
      total: brands.length,
      brands,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ message: "Không tìm thấy brand" });
    }

    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const updateFields = {};
    const allowedFields = ["name", "description", "isActive"];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    });

    if (body.name) {
      updateFields.slug = slugify(body.name, { lower: true, strict: true });
    }

    if (req.file) {
      const oldBrand = await Brand.findById(id);

      if (oldBrand?.logo) {
        const publicId = oldBrand.logo
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        {
          folder: "brands",
          resource_type: "image",
        }
      );

      updateFields.logo = uploadResult.secure_url;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Cập nhật brand thành công",
      brand: updatedBrand,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ message: "Không tìm thấy brand" });
    }

    if (brand.logo) {
      const publicId = brand.logo
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.json({ message: "Đã xóa brand thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
