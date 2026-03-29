import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Image as ImageIcon, Search, X } from "lucide-react";
import brandApi from "../../api/brandApi";
import BrandDelete from "./delete";

const BrandIndex = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    // 1. Khai báo state cho tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await brandApi.getAll();
            setBrands(res.data.brands || []);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu Brand:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 2. Logic lọc dữ liệu dựa trên searchTerm
    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Quản lý Thương hiệu</h2>
                    <p className="text-sm text-slate-500">Hiển thị danh sách thương hiệu trong hệ thống</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 3. Ô Input tìm kiếm */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm tên thương hiệu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all w-full md:w-64"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <Link
                        to="/brands/create"
                        className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-sm whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm mới
                    </Link>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên & Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mô tả</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
                                        Đang tải dữ liệu...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredBrands.length > 0 ? (
                            // 4. Map qua filteredBrands thay vì brands ban đầu
                            filteredBrands.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                                    {/* ... Các ô TD giữ nguyên như cũ ... */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-14 h-14 rounded-xl border border-slate-100 flex items-center justify-center bg-white p-1 shadow-sm">
                                            {item.logo ? (
                                                <img src={item.logo} alt={item.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-slate-300" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">{item.name}</div>
                                        <div className="text-xs text-slate-400 font-mono">slug: {item.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="text-sm text-slate-600 truncate">{item.description || "---"}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                            {item.isActive ? "Hoạt động" : "Tạm ẩn"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex justify-end items-center gap-1">
                                            <Link to={`/brands/view/${item._id}`} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết"><Eye className="w-4 h-4" /></Link>
                                            <Link to={`/brands/update/${item._id}`} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Chỉnh sửa"><Pencil className="w-4 h-4" /></Link>
                                            <BrandDelete id={item._id} onDeleteSuccess={fetchData} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-slate-50 p-4 rounded-full mb-4">
                                            <Search className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">
                                            {searchTerm ? `Không tìm thấy kết quả cho "${searchTerm}"` : "Không tìm thấy thương hiệu nào"}
                                        </p>
                                        <button onClick={() => setSearchTerm("")} className="text-blue-600 text-sm hover:underline mt-1">Xóa bộ lọc</button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BrandIndex;