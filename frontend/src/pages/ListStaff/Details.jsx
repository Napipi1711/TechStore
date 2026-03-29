import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    Package
} from "lucide-react";
import listStaffApi from "../../api/liststaffApi";

export default function Detailstaff() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [saleData, setSaleData] = useState(null);
    const [loading, setLoading] = useState(true);

    const startDateParam = searchParams.get("startDate") || "";
    const endDateParam = searchParams.get("endDate") || "";

    const [startDate, setStartDate] = useState(startDateParam);
    const [endDate, setEndDate] = useState(endDateParam);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Tăng số lượng item mỗi trang vì màn hình giờ đã rộng hơn

    useEffect(() => {
        fetchSale();
        setCurrentPage(1);
    }, [id, startDateParam, endDateParam]);

    const fetchSale = async () => {
        try {
            setLoading(true);
            const res = await listStaffApi.getSaleStatus({
                staffId: id,
                ...(startDateParam && { startDate: startDateParam }),
                ...(endDateParam && { endDate: endDateParam }),
            });
            setSaleData(res.data);
        } catch (err) {
            console.error(err);
            setSaleData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        setSearchParams(params);
    };

    const handleClearFilter = () => {
        setStartDate("");
        setEndDate("");
        setSearchParams({});
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = saleData?.orders?.slice(indexOfFirstItem, indexOfLastItem) || [];
    const totalPages = Math.ceil((saleData?.orders?.length || 0) / itemsPerPage);

    return (
        // Đã xóa max-w-6xl và mx-auto để tràn màn hình
        <div className="p-4 text-gray-900 w-full">

            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
            >
                <ArrowLeft size={18} />
                <span>Quay lại</span>
            </button>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Thống kê bán hàng nhân viên</h2>
            </div>

            {/* Bộ lọc tối ưu không gian */}
            <div className="flex flex-wrap items-end gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-48">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase mb-1">
                        <Calendar size={12} /> Từ ngày
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-black outline-none"
                    />
                </div>
                <div className="w-48">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase mb-1">
                        <Calendar size={12} /> Đến ngày
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-black outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleFilter}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded font-bold text-sm hover:bg-gray-800 transition"
                    >
                        <Search size={16} />
                        Lọc
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={handleClearFilter}
                            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded font-bold text-sm hover:bg-gray-200 transition"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-400 font-medium">Đang tải dữ liệu...</div>
            ) : !saleData ? (
                <div className="text-center py-20 text-red-500 border rounded-lg bg-red-50">Không có dữ liệu</div>
            ) : (
                <div className="space-y-6">
                    {/* Cards tràn ngang */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Tổng đơn hàng</p>
                            <p className="text-2xl font-black">{saleData.totalOrders}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Tổng doanh thu</p>
                            <p className="text-2xl font-black">${saleData.totalRevenue?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 text-blue-600">Tổng lợi nhuận</p>
                            <p className="text-2xl font-black text-blue-600">${saleData.totalProfit?.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Table tràn toàn màn hình */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 font-bold text-[10px] uppercase text-gray-500">Mã đơn</th>
                                    <th className="px-4 py-3 font-bold text-[10px] uppercase text-gray-500">Ngày tháng</th>
                                    <th className="px-4 py-3 font-bold text-[10px] uppercase text-gray-500">Khách hàng</th>
                                    <th className="px-4 py-3 font-bold text-[10px] uppercase text-gray-500">Sản phẩm</th>
                                    <th className="px-4 py-3 font-bold text-[10px] uppercase text-gray-500 text-right">Tổng cộng ($)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentOrders.map(order => (
                                    <tr key={order.saleId} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-blue-600">#{order.saleCode}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {new Date(order.date).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">{order.customer?.name || "Khách lẻ"}</div>
                                            <div className="text-[10px] text-gray-400">{order.customer?.phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {order.items.slice(0, 3).map((item, i) => (
                                                    <span key={i} className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-600">
                                                        {item.productName} (x{item.quantity})
                                                    </span>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="text-[10px] text-gray-400 self-center italic">
                                                        +{order.items.length - 3} món
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                                            ${order.total?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang tràn ngang */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">
                                Hiển thị <span className="text-black font-bold">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, saleData.orders.length)}</span> của {saleData.orders.length} đơn
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="p-1.5 border rounded disabled:opacity-30 hover:bg-gray-50"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded text-xs font-bold transition ${currentPage === i + 1 ? 'bg-black text-white' : 'hover:bg-gray-100 border border-transparent'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="p-1.5 border rounded disabled:opacity-30 hover:bg-gray-50"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}