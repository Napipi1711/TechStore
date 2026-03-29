import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import categoryApi from '../../api/categoriesApi';

const CategoryUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await categoryApi.getById(id);
                setFormData({
                    name: res.data.name,
                    description: res.data.description || '',
                    isActive: res.data.isActive
                });
            } catch (error) {
                navigate('/categories');
            } finally {
                setFetching(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await categoryApi.update(id, formData);
            navigate('/categories');
        } catch (error) {
            alert("Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
            <Loader2 className="animate-spin" size={32} />
            <span className="font-medium">Đang tải dữ liệu...</span>
        </div>
    );

    return (
        <div className="max-w-3xl">

            <button
                onClick={() => navigate('/categories')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 bg-transparent border-none cursor-pointer font-medium transition-colors"
            >
                <ArrowLeft size={18} /> Hủy bỏ & Quay lại
            </button>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Chỉnh sửa danh mục</h1>
                    <p className="text-slate-500 text-sm mt-1">Cập nhật lại thông tin định nghĩa cho nhóm sản phẩm này.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Tên danh mục</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-800 mb-2">Mô tả</label>
                        <textarea
                            rows="5"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-xl border border-slate-100">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-5 h-5 accent-slate-900 cursor-pointer"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <div className="cursor-pointer" onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}>
                            <label htmlFor="isActive" className="text-[15px] font-bold text-slate-800 cursor-pointer">Kích hoạt danh mục</label>
                            <p className="text-xs text-slate-500">Cho phép danh mục này hiển thị ngoài cửa hàng.</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                            {loading ? "Đang lưu thay đổi..." : "Cập nhật dữ liệu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryUpdate;