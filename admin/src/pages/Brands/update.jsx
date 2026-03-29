import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import brandApi from '../../api/brandApi';

const UpdateBrand = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [oldLogo, setOldLogo] = useState(''); // Lưu URL logo cũ từ server

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Hàm tạo Slug tự động
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

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const res = await brandApi.getById(id);
                // Lưu ý: Tùy vào backend trả về res.data hay res.data.brand
                const brand = res.data.brand || res.data; 
                
                setName(brand.name);
                setDescription(brand.description || '');
                setIsActive(brand.isActive);
                setOldLogo(brand.logo);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError("Không thể tải thông tin thương hiệu.");
                setLoading(false);
            }
        };
        fetchBrand();
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('slug', createSlug(name));
        formData.append('description', description);
        formData.append('isActive', isActive);
        
        // Chỉ gửi logo nếu người dùng có chọn file mới
        if (image) {
            formData.append('logo', image);
        }

        try {
            await brandApi.update(id, formData);
            alert('Cập nhật thành công!');
            navigate('/brands');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Lỗi khi cập nhật thương hiệu.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/brands" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Chỉnh sửa thương hiệu</h2>
                    <p className="text-sm text-slate-500 font-mono">ID: {id}</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tên thương hiệu */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tên thương hiệu *</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <p className="mt-1 text-xs text-slate-400">Slug mới: {createSlug(name)}</p>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái hiển thị</label>
                            <select 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                value={isActive}
                                onChange={(e) => setIsActive(e.target.value === 'true')}
                            >
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Tạm ẩn</option>
                            </select>
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả chi tiết</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Logo Section */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Logo thương hiệu</label>
                        <div className="flex items-center gap-8">
                            {/* Khu vực hiển thị ảnh (Cũ hoặc Mới chọn) */}
                            <div className="relative w-32 h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden group">
                                {preview ? (
                                    <img src={preview} alt="New Preview" className="w-full h-full object-contain" />
                                ) : oldLogo ? (
                                    <img src={oldLogo} alt="Old Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <Upload className="w-8 h-8 text-slate-300" />
                                )}
                                
                                {preview && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setPreview(null); setImage(null) }} 
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700 mb-1">Thay đổi logo mới</p>
                                <p className="text-xs text-slate-500 mb-3">Nếu không chọn ảnh mới, hệ thống sẽ giữ lại logo cũ.</p>
                                <input type="file" id="file-update" className="hidden" accept="image/*" onChange={handleImageChange} />
                                <label 
                                    htmlFor="file-update" 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                                >
                                    <Upload className="w-4 h-4" />
                                    Chọn file mới
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-8 flex justify-end gap-3 border-t border-slate-100">
                        <Link 
                            to="/brands" 
                            className="px-6 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Hủy bỏ
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl bg-slate-900 text-white font-medium shadow-lg transition-all ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`}
                        >
                            <Save className="w-4 h-4" />
                            {submitting ? 'Đang lưu...' : 'Cập nhật thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateBrand;