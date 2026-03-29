import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Tag, FileText, Info, Clock, Hash } from 'lucide-react';
import categoryApi from '../../api/categoriesApi';

const CategoryView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await categoryApi.getById(id);
                setCategory(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <span className="font-medium">Đang tải chi tiết danh mục...</span>
        </div>
    );

    if (!category) return (
        <div className="p-10 text-center">
            <div className="text-red-500 font-bold mb-4">Lỗi: Không tìm thấy danh mục!</div>
            <button onClick={() => navigate('/categories')} className="text-slate-900 underline font-medium">Quay lại danh sách</button>
        </div>
    );

    return (
        <div className="max-w-5xl">
            {/* Header Action */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/categories')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors bg-transparent border-none cursor-pointer font-medium"
                >
                    <ArrowLeft size={20} /> Quay lại danh sách
                </button>

                <Link
                    to={`/categories/update/${category._id}`}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all no-underline font-bold shadow-lg shadow-slate-900/10"
                >
                    <Pencil size={18} /> Chỉnh sửa thông tin
                </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3">

                    {/* Left Column: Primary Info */}
                    <div className="md:col-span-2 p-10 space-y-10 border-r border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 text-slate-400 mb-3 font-bold uppercase text-[11px] tracking-[0.15em]">
                                <Tag size={14} /> Thông tin tên gọi
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 leading-tight">
                                {category.name}
                            </h1>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-slate-400 mb-4 font-bold uppercase text-[11px] tracking-[0.15em]">
                                <FileText size={14} /> Nội dung mô tả
                            </div>
                            <div className="p-8 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed border border-slate-100 text-lg italic shadow-inner">
                                {category.description || "Danh mục này hiện chưa có nội dung mô tả chi tiết."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Metadata */}
                    <div className="bg-slate-50/50 p-10 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
                                <Info size={18} /> Chi tiết hệ thống
                            </h3>

                            <div className="space-y-6">
                                {/* Status */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Trạng thái hiển thị</p>
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${category.isActive
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-200 text-slate-600'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${category.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                        {category.isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐANG TẠM ẨN'}
                                    </span>
                                </div>

                                {/* ID */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-wider">Mã định danh (ID)</p>
                                    <div className="flex items-center gap-2 text-[11px] font-mono bg-white p-3 rounded-xl border border-slate-200 text-slate-500">
                                        <Hash size={12} /> {category._id}
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="pt-6 border-t border-slate-200 space-y-4">
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase mb-2">
                                        <Clock size={14} /> Nhật ký thời gian
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-medium">Ngày tạo hệ thống</span>
                                            <span className="text-xs font-semibold text-slate-700">{new Date(category.createdAt).toLocaleString('vi-VN')}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-medium">Cập nhật lần cuối</span>
                                            <span className="text-xs font-semibold text-slate-700">{new Date(category.updatedAt).toLocaleString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CategoryView;