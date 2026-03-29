import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    Image as ImageIcon,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    ArrowUpDown,
    Package,
    AlertCircle
} from 'lucide-react';
import productApi from '../../api/productApi';

const PAGE_SIZE = 8; // Tăng lên 8 vì giao diện card chiếm ít diện tích dọc hơn

const ProductIndex = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('active');
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await productApi.getAll();
            setProducts(Array.isArray(res.data.products) ? res.data.products : []);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận ẩn sản phẩm này?')) return;
        await productApi.delete(id);
        setProducts(prev => prev.filter(p => p._id !== id));
    };

    const filteredProducts = useMemo(() => {
        let data = [...products];
        if (filterStatus === 'active') data = data.filter(p => p.isActive === true);
        else if (filterStatus === 'inactive') data = data.filter(p => p.isActive === false);

        if (search.trim()) {
            data = data.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
        }

        const sortMap = {
            name_asc: (a, b) => (a.name || '').localeCompare(b.name || ''),
            price_desc: (a, b) => (b.price || 0) - (a.price || 0),
            qty_desc: (a, b) => (b.quantity || 0) - (a.quantity || 0),
            qty_asc: (a, b) => (a.quantity || 0) - (b.quantity || 0),
            oldest: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0),
            newest: (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
        };
        return data.sort(sortMap[sortBy] || sortMap.newest);
    }, [products, search, sortBy, filterStatus]);

    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const paginatedProducts = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredProducts.slice(start, start + PAGE_SIZE);
    }, [filteredProducts, page]);

    useEffect(() => setPage(1), [search, sortBy, filterStatus]);

    return (
        <div className="min-h-screen bg-[#F8F9FB] p-4 lg:p-8">

            {/* TOP BAR: THÔNG TIN TỔNG QUAN */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kho hàng</h1>
                    <p className="text-slate-500 font-medium">Quản lý và theo dõi {filteredProducts.length} sản phẩm hiện có</p>
                </div>
                <Link
                    to="/products/create"
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span>Thêm sản phẩm mới</span>
                </Link>
            </div>

            {/* BAR CÔNG CỤ: SEARCH & FILTER */}
            <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap items-center gap-4 mb-8">
                <div className="relative flex-1 min-w-[300px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm kiếm theo tên sản phẩm..."
                        className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>

                <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    {['active', 'inactive', 'all'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilterStatus(st)}
                            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filterStatus === st ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {st === 'active' ? 'Đang bán' : st === 'inactive' ? 'Tạm ẩn' : 'Tất cả'}
                        </button>
                    ))}
                </div>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border-none text-sm font-semibold text-slate-600 py-3 px-4 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                    <option value="newest">Mới nhất</option>
                    <option value="name_asc">Tên A-Z</option>
                    <option value="price_desc">Giá cao nhất</option>
                    <option value="qty_desc">Tồn kho nhiều</option>
                </select>
            </div>

            {/* GRID DANH SÁCH SẢN PHẨM */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-slate-200 h-64 rounded-[2rem]"></div>
                    ))}
                </div>
            ) : paginatedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                    <AlertCircle size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium text-lg">Không tìm thấy sản phẩm nào phù hợp</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((item) => (
                        <div key={item._id} className="group bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            {/* Ảnh sản phẩm */}
                            <div className="relative aspect-square rounded-[1.5rem] bg-slate-50 overflow-hidden mb-4">
                                {item.images?.[0] ? (
                                    <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border ${item.isActive ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-400 border-slate-300 text-white'
                                        }`}>
                                        {item.isActive ? 'Hoạt Động' : 'Draft'}
                                    </span>
                                </div>
                            </div>

                            {/* Thông tin */}
                            <div className="px-2">
                                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{item.brandId?.name || 'No Brand'}</p>
                                <h3 className="font-bold text-slate-800 text-lg truncate mb-2">{item.name}</h3>

                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Giá bán</p>
                                        <p className="text-xl font-black text-slate-900">${item.price?.toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase italic">Kho: {item.quantity ?? 0}</p>
                                    </div>
                                </div>

                                {/* Thao tác nhanh */}
                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                                    <Link to={`/products/view/${item._id}`} className="flex items-center justify-center p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                        <Eye size={18} />
                                    </Link>
                                    <Link to={`/products/update/${item._id}`} className="flex items-center justify-center p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                        <Pencil size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(item._id)} className="flex items-center justify-center p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* PHÂN TRANG PHONG CÁCH MỚI */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Hiển thị <span className="text-slate-900">{paginatedProducts.length}</span> trên {filteredProducts.length} sản phẩm
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === i + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-100 text-slate-400'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductIndex;