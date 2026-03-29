import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import categoryApi from '../../api/categoriesApi';

const CategoryCreate = () => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return alert("Vui lòng nhập tên danh mục!");
        
        setLoading(true);
        try {
            await categoryApi.create(formData);
            navigate('/categories');
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi khi tạo danh mục!");
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="max-w-3xl">
            <button 
                onClick={() => navigate('/categories')} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 bg-transparent border-none cursor-pointer font-medium transition-colors"
            >
                <ArrowLeft size={18} /> Quay lại danh sách
            </button>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Thêm danh mục mới</h1>
                    <p className="text-slate-500 text-sm mt-1">Điền thông tin bên dưới để tạo nhóm sản phẩm mới.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                            Tên danh mục <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all placeholder:text-slate-400"
                            placeholder="Ví dụ: Đồ điện tử, Thời trang nam..." 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">
                            Mô tả chi tiết
                        </label>
                        <textarea 
                            rows="5" 
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none placeholder:text-slate-400"
                            placeholder="Nhập mô tả ngắn gọn về nhóm sản phẩm này..." 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <Save size={20} />
                            )}
                            {loading ? "Đang lưu hệ thống..." : "Lưu danh mục ngay"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryCreate;