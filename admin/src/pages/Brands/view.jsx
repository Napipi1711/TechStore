import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Pencil, Calendar, Globe, Info, CheckCircle2, XCircle } from 'lucide-react';
import brandApi from '../../api/brandApi';

const ViewBrand = () => {
    const { id } = useParams();
    const [brand, setBrand] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const res = await brandApi.getById(id);
                // Dựa trên JSON trước đó, dữ liệu nằm trong res.data.brand
                setBrand(res.data.brand || res.data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết thương hiệu:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBrand();
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    if (!brand) return (
        <div className="text-center p-10 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            Không tìm thấy thông tin thương hiệu này.
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/brands" className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-all">
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{brand.name}</h2>
                        <p className="text-sm text-slate-500 font-mono italic">ID: {brand._id}</p>
                    </div>
                </div>

                <Link
                    to={`/brands/update/${brand._id}`}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-medium"
                >
                    <Pencil className="w-4 h-4" />
                    Chỉnh sửa thông tin
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Logo & Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                        <div className="w-40 h-40 rounded-2xl border border-slate-100 p-2 flex items-center justify-center bg-slate-50 overflow-hidden mb-6">
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-slate-300 text-xs text-center">Chưa có logo</div>
                            )}
                        </div>

                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <span className="text-sm text-slate-500 font-medium">Trạng thái:</span>
                                {brand.isActive ? (
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                                        <CheckCircle2 className="w-4 h-4" /> Hoạt động
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-slate-400 font-bold text-sm">
                                        <XCircle className="w-4 h-4" /> Tạm ẩn
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" />
                            <h3 className="font-bold text-slate-800">Thông tin cơ bản</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Tên thương hiệu</label>
                                <p className="text-slate-900 font-medium">{brand.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> Đường dẫn (Slug)
                                </label>
                                <p className="text-blue-600 font-mono text-sm">/{brand.slug}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Mô tả</label>
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {brand.description || "Thương hiệu này chưa có mô tả chi tiết."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" />
                            <h3 className="font-bold text-slate-800">Thời gian hệ thống</h3>
                        </div>
                        <div className="p-6 flex flex-wrap gap-8">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Ngày tạo</label>
                                <p className="text-slate-700 text-sm">{new Date(brand.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cập nhật lần cuối</label>
                                <p className="text-slate-700 text-sm">{new Date(brand.updatedAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewBrand;