import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Layers, Search, X } from 'lucide-react';
import categoryApi from '../../api/categoriesApi';

const CategoryIndex = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    // 1. Thêm state tìm kiếm
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await categoryApi.getAll();
            setCategories(res.data || []);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. Logic lọc danh mục
    const filteredCategories = categories.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (window.confirm("Xác nhận xóa danh mục này?")) {
            try {
                await categoryApi.delete(id);
                setCategories(prev => prev.filter(item => item._id !== id));
            } catch (error) { alert("Xóa thất bại!"); }
        }
    };

    return (
        <div className="bg-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Danh mục sản phẩm</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý các nhóm hàng hóa của hệ thống</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* 3. Ô Input tìm kiếm */}
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm danh mục..."
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
                        to="/categories/create"
                        className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all no-underline font-medium shadow-sm whitespace-nowrap"
                    >
                        <Plus size={18} /> Thêm danh mục
                    </Link>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600">Tên danh mục</th>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600">Mô tả</th>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600">Trạng thái</th>
                            <th className="p-4 text-[13px] uppercase tracking-wider font-semibold text-slate-600 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredCategories.length === 0 ? (
                            // 4. Hiển thị thông báo khi không tìm thấy kết quả
                            <tr>
                                <td colSpan="4" className="p-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center py-4">
                                        <Search className="w-8 h-8 text-slate-200 mb-2" />
                                        <p>{searchTerm ? `Không tìm thấy danh mục nào khớp với "${searchTerm}"` : "Không có dữ liệu danh mục"}</p>
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm("")}
                                                className="mt-2 text-indigo-600 hover:underline text-sm"
                                            >
                                                Xóa tìm kiếm
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            // 5. Render dữ liệu đã lọc (filteredCategories)
                            filteredCategories.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                                                <Layers size={18} />
                                            </div>
                                            <span className="font-semibold text-slate-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 max-w-[300px] truncate">
                                        {item.description || <span className="text-slate-300 italic">Chưa có mô tả</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${item.isActive
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                            }`}>
                                            {item.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link
                                                title="Xem chi tiết"
                                                to={`/categories/view/${item._id}`}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link
                                                title="Chỉnh sửa"
                                                to={`/categories/update/${item._id}`}
                                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <button
                                                title="Xóa"
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all bg-transparent border-none cursor-pointer"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryIndex;