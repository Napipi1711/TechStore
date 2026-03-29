
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2, Upload, X } from "lucide-react";

import productApi from "../../api/productApi";
import categoryApi from "../../api/categoriesApi";
import brandApi from "../../api/brandApi";

const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:outline-none transition";

const ProductUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        unit: "",
        categoryId: "",
        brandId: "",
        images: [],
    });

    /* ================= FETCH DATA ================= */

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [productRes, cateRes, brandRes] = await Promise.all([
                    productApi.getById(id),
                    categoryApi.getAll(),
                    brandApi.getAll(),
                ]);

                const product = productRes.data;

                setFormData({
                    name: product.name || "",
                    price: product.price || "",
                    description: product.description || "",
                    unit: product.unit || "",
                    categoryId: product.categoryId?._id || "",
                    brandId: product.brandId?._id || "",
                    images: [],
                });

                setPreviews(product.images || []);

                setCategories(
                    Array.isArray(cateRes.data)
                        ? cateRes.data
                        : cateRes.data?.categories || []
                );

                setBrands(
                    Array.isArray(brandRes.data)
                        ? brandRes.data
                        : brandRes.data?.brands || []
                );
            } catch (err) {
                console.error(err);
                navigate("/products");
            } finally {
                setFetching(false);
            }
        };

        fetchAll();
    }, [id, navigate]);

    /* ================= HANDLERS ================= */

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...files],
        }));

        setPreviews((prev) => [
            ...prev,
            ...files.map((f) => URL.createObjectURL(f)),
        ]);
    };

    const removePreview = (index) => {
        setPreviews((prev) => prev.filter((_, i) => i !== index));

        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === "images") {
                    value.forEach((img) => productData.append("images", img));
                } else if (value !== "") {
                    productData.append(key, value);
                }
            });

            await productApi.update(id, productData);

            navigate("/products");
        } catch (err) {
            alert("Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-20 text-center text-slate-400">Đang tải...</div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6"
            >
                <ArrowLeft size={18} />
                Quay lại
            </button>

            <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">

                {/* LEFT */}

                <div className="col-span-2 space-y-6">
                    <div className="bg-white border rounded-2xl p-6 shadow-sm">

                        <h2 className="text-lg font-bold mb-6">
                            Thông tin sản phẩm
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <label className={labelClass}>Tên sản phẩm</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Thương hiệu</label>
                                <select
                                    name="brandId"
                                    value={formData.brandId}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                >
                                    <option value="">-- Chọn thương hiệu --</option>
                                    {brands.map((b) => (
                                        <option key={b._id} value={b._id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className={labelClass}>Danh mục</label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => (
                                            <option key={c._id} value={c._id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Đơn vị</label>
                                    <input
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="ví dụ: cái, hộp, chai"
                                        required
                                    />
                                </div>

                            </div>

                            <div>
                                <label className={labelClass}>Giá bán</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className={inputClass}
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>

                        </div>
                    </div>
                </div>

                {/* RIGHT */}

                <div className="space-y-6">

                    <div className="bg-white border rounded-2xl p-6 shadow-sm">

                        <h2 className="font-bold mb-4">Hình ảnh</h2>

                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer">
                            <Upload className="text-slate-400 mb-2" />
                            <span className="text-sm text-slate-500">
                                Click hoặc kéo ảnh
                            </span>

                            <input
                                type="file"
                                multiple
                                hidden
                                onChange={handleFileChange}
                            />
                        </label>

                        <div className="grid grid-cols-3 gap-3 mt-4">

                            {previews.map((img, i) => (
                                <div key={i} className="relative">

                                    <img
                                        src={img}
                                        alt="preview"
                                        className="h-24 w-full object-cover rounded-lg"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removePreview(i)}
                                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1"
                                    >
                                        <X size={14} />
                                    </button>

                                </div>
                            ))}

                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <RefreshCw size={20} />
                        )}

                        Cập nhật sản phẩm
                    </button>

                </div>

            </form>
        </div>
    );
};

export default ProductUpdate;

