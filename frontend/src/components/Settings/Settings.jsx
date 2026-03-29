import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Search, FileDown, FileSpreadsheet, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";
import revenueApi from "../../api/revenueApi";
import { useSearchParams } from "react-router-dom";
import { exportRevenueExcel } from "../../utils/excelUtils";
import { exportRevenuePDF } from "../../utils/pdfUtils";

export default function Settings() {
    const { user, logout } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [from, setFrom] = useState(searchParams.get("from") || "");
    const [to, setTo] = useState(searchParams.get("to") || "");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    // Logic xác nhận xuất file
    const [confirmModal, setConfirmModal] = useState({ show: false, type: null });

    // Logic phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (from && to) fetchData(from, to);
    }, []);

    const fetchData = async (f, t) => {
        setLoading(true);
        try {
            const res = await revenueApi.exportReport({ from: f, to: t });
            setData(res.data.data || []);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    const handleSearch = () => {
        if (!from || !to) {
            alert("Vui lòng chọn đầy đủ ngày từ và đến");
            return;
        }
        setSearchParams({ from, to });
        fetchData(from, to);
    };

    // Xử lý xuất file sau khi xác nhận
    const executeExport = () => {
        if (confirmModal.type === "EXCEL") exportRevenueExcel(data, { from, to });
        if (confirmModal.type === "PDF") exportRevenuePDF(data, { from, to });
        setConfirmModal({ show: false, type: null });
    };

    const minimalInput = "border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-black outline-none transition-all w-full text-black bg-white";
    const minimalBtn = "border border-black px-6 py-2 rounded-lg font-medium text-sm hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 text-black";
    const pageBtn = "w-10 h-10 border border-slate-200 flex items-center justify-center rounded-lg hover:border-black transition-all text-sm";

    return (
        <div className="min-h-screen bg-white text-black w-full font-sans p-6 relative">

            {/* --- MODAL XÁC NHẬN (POPUP) --- */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 relative overflow-hidden">
                        <button onClick={() => setConfirmModal({ show: false, type: null })} className="absolute top-4 right-4 text-slate-400 hover:text-black">
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="text-black" size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 uppercase tracking-tighter">Xác nhận xuất file</h3>
                            <p className="text-slate-500 text-sm mb-8">
                                Bạn có chắc chắn muốn xuất báo cáo định dạng <span className="font-bold text-black">{confirmModal.type}</span> không?
                            </p>
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button onClick={() => setConfirmModal({ show: false, type: null })} className="py-3 rounded-xl border border-slate-100 text-sm font-bold hover:bg-slate-50 transition-colors">
                                    Hủy bỏ
                                </button>
                                <button onClick={executeExport} className="py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-slate-800 transition-colors">
                                    Đồng ý xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-12 max-w-[1600px] mx-auto">

                {/* Cột trái: Profile (Giữ nguyên) */}
                <div className="xl:col-span-1 flex flex-col items-center">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm text-center relative overflow-hidden w-full max-w-sm">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        <div className="inline-block relative mb-4">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white text-4xl font-black shadow-2xl rotate-3 transition-transform hover:rotate-0 cursor-pointer">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg"></span>
                        </div>
                        <h2 className="text-xl font-black text-slate-800">{user?.name || "Người dùng"}</h2>
                        <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1 mb-8 bg-blue-50 py-1 px-3 rounded-full inline-block">
                            {user?.branchRole === "branch_manager" ? "Quản lý chi nhánh" : "Nhân viên"}
                        </p>
                        <button onClick={logout} className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                            <LogOut size={18} /> Đăng xuất ngay
                        </button>
                    </div>
                </div>

                {/* Cột phải: Content (chỉ hiện nếu branch_manager) */}
                {user?.branchRole === "branch_manager" && (
                    <div className="xl:col-span-3 bg-white">
                        <header className="mb-10 group">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="h-8 w-[2px] bg-black"></div>
                                <h2 className="text-3xl font-black tracking-tighter uppercase text-black">
                                    Báo cáo <span className="font-light text-slate-400">hệ thống</span>
                                </h2>
                            </div>
                        </header>

                        {/* Filter */}
                        <div className="flex flex-col sm:flex-row items-end gap-4 mb-10">
                            <div className="flex-1 w-full">
                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Từ ngày</label>
                                <input
                                    type="date"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className={minimalInput}
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Đến ngày</label>
                                <input
                                    type="date"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className={minimalInput}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className={`${minimalBtn} h-[42px] bg-black text-white`}
                            >
                                <Search size={16} /> Tìm kiếm
                            </button>
                        </div>

                        {/* Dữ liệu, phân trang và export */}
                        {loading ? (
                            <p className="py-20 text-center text-slate-400 animate-pulse italic">
                                Đang truy xuất dữ liệu...
                            </p>
                        ) : data.length > 0 ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Table */}
                                <div className="overflow-x-auto min-h-[480px]">
                                    <table className="w-full table-auto text-sm border-collapse">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-50 text-[11px] uppercase tracking-widest">
                                                <th className="px-4 py-5 font-bold text-left">Mã đơn</th>
                                                <th className="px-4 py-5 font-bold text-left">Ngày</th>
                                                <th className="px-4 py-5 font-bold text-left">Sản phẩm</th>
                                                <th className="px-4 py-5 font-bold text-right">Số lượng</th>
                                                <th className="px-4 py-5 font-bold text-right">Doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {currentItems.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-4 py-4 font-mono text-[12px] text-slate-400 group-hover:text-black">{row.saleCode}</td>
                                                    <td className="px-4 py-4">{new Date(row.paidAt).toLocaleDateString()}</td>
                                                    <td className="px-4 py-4 font-medium">{row.productName}</td>
                                                    <td className="px-4 py-4 text-right italic">{row.quantity}</td>
                                                    <td className="px-4 py-4 text-right font-black">{Number(row.revenue).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black">
                                        Page {currentPage} of {totalPages} — {data.length} Records
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            className={`${pageBtn} disabled:opacity-20`}
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            className={`${pageBtn} disabled:opacity-20`}
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Export Buttons */}
                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => setConfirmModal({ show: true, type: "EXCEL" })}
                                        className={minimalBtn}
                                    >
                                        <FileSpreadsheet size={18} /> Xuất Excel
                                    </button>
                                    <button
                                        onClick={() => setConfirmModal({ show: true, type: "PDF" })}
                                        className={minimalBtn}
                                    >
                                        <FileDown size={18} /> Xuất PDF
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center border border-dashed border-slate-100 rounded-3xl text-slate-300 text-sm italic">
                                Không tìm thấy bản ghi nào trong khoảng thời gian này
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}