import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X, Plus, Image as ImageIcon } from "lucide-react";

import productApi from "../../api/productApi";
import categoryApi from "../../api/categoriesApi";
import brandApi from "../../api/brandApi";
import toast, { Toaster } from "react-hot-toast";
const ProductCreate = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    categoryId: "",
    brandId: "",
    unit: "",
    isActive: true,
    images: [],
  });

  /* ================= FETCH DATA (Giữ nguyên) ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data.categories || res.data || []);
      } catch (error) {
        console.error("Lỗi categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandApi.getAll();
        setBrands(res.data.brands || res.data || []);
      } catch (error) {
        console.error("Lỗi brands:", error);
      }
    };
    fetchBrands();
  }, []);

  /* ================= HANDLE LOGIC (Giữ nguyên) ================= */
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      images: [...formData.images, ...files],
    });
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    const newPreviews = [...previews];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setFormData({ ...formData, images: newImages });
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "images") data.append(key, formData[key]);
      });
      formData.images.forEach((file) => data.append("images", file));

      await productApi.create(data);
      alert("Tạo sản phẩm thành công");
      navigate("/products");
    } catch (error) {
      console.error("CREATE PRODUCT ERROR:", error);
      alert(error.response?.data?.message || "Lỗi tạo sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI NEW DESIGN ================= */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/products")}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">Thêm sản phẩm</h1>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-6 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-70 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            {loading ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5 ml-1">Tên sản phẩm *</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Mã SKU *</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all"
                  value={formData.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Đơn vị *</label>
                <input
                  required
                  placeholder="Hộp, Cái, kg..."
                  className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all"
                  value={formData.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Mô tả chi tiết</h3>
            <textarea
              rows="6"
              className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Hình ảnh sản phẩm</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((img, index) => (
                <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden border">
                  <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-red-500 hover:text-white text-red-500 rounded-full p-1.5 shadow-md transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}

              <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all text-slate-400 hover:text-indigo-600">
                <ImageIcon size={32} strokeWidth={1.5} />
                <span className="text-xs font-medium mt-2">Thêm ảnh</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar settings */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Phân loại & Giá</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Danh mục *</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all appearance-none"
                  value={formData.categoryId}
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Thương hiệu</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all appearance-none"
                  value={formData.brandId}
                  onChange={(e) => handleChange("brandId", e.target.value)}
                >
                  <option value="">Chọn brand</option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 ml-1">Giá bán *</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all font-mono text-lg text-indigo-600"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="p-4 bg-slate-50 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Trạng thái</h3>
            <label className="relative flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="peer hidden"
                checked={formData.isActive}
                onChange={(e) => handleChange("isActive", e.target.checked)}
              />
              <div className="w-12 h-6 bg-slate-300 rounded-full peer-checked:bg-green-500 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
              <span className="font-semibold text-slate-700">Kích hoạt bán</span>
            </label>
          </section>
        </div>

      </form>
    </div>
  );
};

export default ProductCreate;