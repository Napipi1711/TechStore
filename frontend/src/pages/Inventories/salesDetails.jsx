import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowLeft, Package, Hash, ChevronLeft, ChevronRight,
    CreditCard, Calendar, XCircle, Filter
} from "lucide-react";

import { getSaleDetailsApi } from "../../api/posApi";

export default function SalesDetails() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [fromDate, setFromDate] = useState(searchParams.get("from") || "");
    const [toDate, setToDate] = useState(searchParams.get("to") || "");

    const [tempFromDate, setTempFromDate] = useState(fromDate);
    const [tempToDate, setTempToDate] = useState(toDate);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = data.slice(indexOfFirst, indexOfLast);
    const totalQty = data.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    const formatUSD = (v) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = {};
            if (fromDate) query.from = fromDate;
            if (toDate) query.to = toDate;

            const res = await getSaleDetailsApi(productId, query);
            if (res.data.success) {
                setData(res.data.data);
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("SALE DETAILS ERROR:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const params = {};
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;
        setSearchParams(params);
        fetchData();
    }, [fromDate, toDate, productId]);

    const handleApplyFilter = () => {
        setFromDate(tempFromDate);
        setToDate(tempToDate);
    };

    const handleClearFilter = () => {
        setTempFromDate("");
        setTempToDate("");
        setFromDate("");
        setToDate("");
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen font-sans text-slate-900">

            {/* HEADER */}
            <div className="space-y-2">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Quay lại
                </button>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                    Lịch sử <span className="text-blue-600 italic">Giao dịch</span>
                </h2>
            </div>

            {/* TOP CARDS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* CARD 1: TỔNG SẢN LƯỢNG */}
                <div className="lg:col-span-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tổng sản lượng</p>
                        <p className="text-2xl font-black tracking-tight">
                            {totalQty.toLocaleString()} <span className="text-xs font-bold text-slate-400 uppercase">đơn vị</span>
                        </p>
                    </div>
                </div>

                {/* CARD 2: BỘ LỌC THỜI GIAN */}
                <div className="lg:col-span-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
                    <div className="grid grid-cols-2 gap-2 w-full flex-1">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                            <Calendar size={18} className="text-blue-500 shrink-0" />
                            <div className="flex flex-col w-full">
                                <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Từ ngày</span>
                                <input type="date" value={tempFromDate} onChange={e => setTempFromDate(e.target.value)} className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none w-full" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all">
                            <Calendar size={18} className="text-blue-500 shrink-0" />
                            <div className="flex flex-col w-full">
                                <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Đến ngày</span>
                                <input type="date" value={tempToDate} onChange={e => setTempToDate(e.target.value)} className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none w-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <button onClick={handleApplyFilter} disabled={loading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:bg-slate-300">
                            {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Filter size={14} />}
                            Lọc
                        </button>
                        {(tempFromDate || tempToDate) && (
                            <button onClick={handleClearFilter} className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-100" title="Xóa lọc"><XCircle size={20} /></button>
                        )}
                    </div>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <Hash size={18} className="text-blue-600" />
                        <span className="font-black text-sm uppercase tracking-tight">Chi tiết giao dịch</span>
                    </div>
                    <div className="px-3 py-1 bg-blue-50 rounded-full text-[10px] font-black text-blue-600 uppercase border border-blue-100">
                        Trang {currentPage} / {totalPages || 1}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-50 bg-white">
                                <th className="px-6 py-4">Mã đơn</th>
                                <th className="px-6 py-4 text-center">SL</th>
                                <th className="px-6 py-4">Tài chính (Giá/Lãi)</th>
                                <th className="px-6 py-4">Thanh toán</th>
                                <th className="px-6 py-4">Nhân viên / Khách</th>
                                <th className="px-6 py-4">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-[13px]">
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-gray-400 font-bold italic">Không tìm thấy dữ liệu...</td>
                                </tr>
                            ) : currentItems.map(item => (
                                <tr key={item._id} className="group hover:bg-blue-50/20 transition-all text-slate-700">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 group-hover:bg-white transition-colors">
                                            #{item.saleCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black">{item.quantity}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-500">{formatUSD(item.price)}</div>
                                        <div className={`font-black text-[10px] mt-0.5 ${item.profitAmount >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                            {item.profitAmount >= 0 ? "+" : ""}{formatUSD(item.profitAmount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-black text-[10px] uppercase text-slate-500">
                                            <CreditCard size={14} /> {item.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-xs text-slate-800">{item.staffName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold italic truncate max-w-[120px]">{item.customerName || "Khách lẻ"}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-black text-xs">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
                                        <div className="text-[10px] text-gray-400 font-black uppercase">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION SECTION */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-5 bg-gray-50/50 border-t border-gray-100">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest order-2 sm:order-1">
                            Hiển thị {indexOfFirst + 1} - {Math.min(indexOfLast, data.length)} / {data.length} đơn
                        </span>

                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-200 transition-all shadow-sm active:scale-90"
                            >
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>

                            <div className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <span className="text-xs font-black text-blue-600">{currentPage}</span>
                                <span className="mx-2 text-gray-300">/</span>
                                <span className="text-xs font-black text-gray-400">{totalPages}</span>
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white rounded-xl border border-gray-200 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:border-gray-200 transition-all shadow-sm active:scale-90"
                            >
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}