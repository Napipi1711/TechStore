import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import dashboardApi from "../../api/dashboardApi";
import branchApi from "../../api/branchApi";
import { exportRevenueExcel } from "../../../ultis/excelUtil";

const Setting = () => {
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [branchId, setBranchId] = useState("");
    const [branches, setBranches] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // PHÂN TRANG STATE
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await branchApi.getAll();
                setBranches(res.data.branches || []);
            } catch (err) { console.error(err); }
        };
        fetchBranches();

        const today = new Date().toISOString().slice(0, 10);
        setFrom(today);
        setTo(today);
    }, []);

    const handleFetch = async () => {
        if (!from || !to) {
            Swal.fire("Note", "Please select a date range!", "warning");
            return;
        }
        setLoading(true);
        try {
            const params = { from, to };
            if (branchId) params.branchId = branchId;
            const res = await dashboardApi.exportReport(params);
            const result = res.data.data || [];
            setData(result);
            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm mới
            if (result.length === 0) Swal.fire("Info", "Không có đơn được bán!", "info");
        } catch (err) {
            Swal.fire("Error", "Failed to fetch data!", "error");
        } finally { setLoading(false); }
    };

    // LOGIC PHÂN TRANG
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // FORMAT USD
    const formatUSD = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto text-slate-800">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-3xl font-light tracking-tight">Xem doanh thu</h2>
                    <p className="text-slate-400 text-sm italic">
                        Tổng quan hoạt động của chi nhánh</p>
                </div>
                <button
                    onClick={() => exportRevenueExcel(data)}
                    disabled={data.length === 0}
                    className="border border-slate-300 px-5 py-2 rounded hover:bg-slate-50 transition-all text-sm font-medium disabled:opacity-30"
                >
                    Export CSV
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="p-2 outline-none text-sm bg-transparent" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="p-2 outline-none text-sm bg-transparent border-l border-slate-100" />
                <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="p-2 outline-none text-sm bg-transparent border-l border-slate-100 cursor-pointer">
                    <option value="">Tất cả chi nhánh</option>
                    {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
                <button
                    onClick={handleFetch}
                    className="bg-slate-900 text-white rounded py-2 text-sm hover:bg-slate-800 transition-all font-medium"
                >
                    {loading ? "Loading..." : "Filter Data"}
                </button>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">STT</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mã</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày Thanh toán</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">chi nhánh</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Doanh thu</th>
                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="wait">
                            {currentItems.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-slate-400">No records available</td></tr>
                            ) : (
                                currentItems.map((item, index) => (
                                    <motion.tr
                                        key={item.saleCode + index}
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="p-4 text-sm text-slate-400">{indexOfFirstItem + index + 1}</td>
                                        <td className="p-4 text-sm font-mono text-slate-600">{item.saleCode}</td>
                                        <td className="p-4 text-sm">{new Date(item.paidAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-sm"><span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">{item.branchName}</span></td>
                                        <td className="p-4 text-sm font-medium text-slate-600">{formatUSD(item.revenue)}</td>
                                        <td className="p-4 text-sm text-right font-bold">{formatUSD(item.profit)}</td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-50 disabled:opacity-20"
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded text-sm transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-50 disabled:opacity-20"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default Setting;