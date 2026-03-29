import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Upload, Save, X, AlertCircle } from 'lucide-react';
import brandApi from '../../api/brandApi';

const CreateBrand = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorDetails, setErrorDetails] = useState(null);
    const navigate = useNavigate();

    // Hàm tạo Slug tự động (Ví dụ: "Apple 13 Pro" -> "apple-13-pro")
    const createSlug = (str) => {
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/([^0-9a-z-\s])/g, "")
            .replace(/(\s+)/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorDetails(null);
        setLoading(true);

        const slug = createSlug(name);

        // Tạo FormData khớp chính xác với Schema
        const formData = new FormData();
        formData.append('name', name);
        formData.append('slug', slug); // Thêm slug vì Schema yêu cầu required
        formData.append('description', description);

        if (image) {
            // Đổi từ 'image' thành 'logo' để khớp với Schema của bạn
            formData.append('logo', image);
        }

        try {
            await brandApi.create(formData);
            alert('Tạo thương hiệu thành công!');
            navigate('/brands');
        } catch (err) {
            console.error("Lỗi:", err.response?.data);
            setErrorDetails(err.response?.data?.message || "Lỗi 500: Kiểm tra trùng tên/slug hoặc lỗi Server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/brands" className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-900">Thêm Thương Hiệu</h2>
            </div>

            {errorDetails && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{errorDetails}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tên & Slug Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên thương hiệu *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Nhập tên..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <p className="mt-1 text-xs text-slate-400 font-mono">Slug: {createSlug(name)}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái</label>
                            <div className="flex items-center h-[52px]">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Đang hoạt động (Mặc định)</span>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            placeholder="Nhập giới thiệu về thương hiệu..."
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Upload Logo */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Logo thương hiệu</label>
                        <div className="flex items-center gap-6">
                            <div className="relative w-28 h-28 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden group">
                                {preview ? (
                                    <>
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => { setPreview(null); setImage(null) }} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <Upload className="w-8 h-8 text-slate-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
                                <label htmlFor="file-upload" className="inline-flex px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                    Chọn Logo
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t">
                        <Link to="/brands" className="px-6 py-2.5 rounded-xl border font-medium text-slate-600 hover:bg-slate-50">Hủy</Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl bg-slate-900 text-white font-medium shadow-lg transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Đang tạo...' : 'Lưu thương hiệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBrand;