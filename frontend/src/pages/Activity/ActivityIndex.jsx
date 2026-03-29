import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, RotateCcw, Calendar, User, Activity } from "lucide-react";
import activityApi from "../../api/activityApi";

export default function ActivityIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [formFilters, setFormFilters] = useState({
        staffName: searchParams.get("staffName") || "",
        date: searchParams.get("date") || "",
    });

    const [logs, setLogs] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const currentPage = Number(searchParams.get("page")) || 1;
    const currentStaffName = searchParams.get("staffName") || "";
    const currentDate = searchParams.get("date") || "";

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await activityApi.getAll({
                    staffName: currentStaffName,
                    date: currentDate,
                    page: currentPage,
                    limit: 12
                });
                setLogs(res.data.data || []);
                setTotalPages(res.data.totalPages || 1);
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [currentStaffName, currentDate, currentPage]);

    const handleInputChange = (e) => {
        setFormFilters({ ...formFilters, [e.target.name]: e.target.value });
    };

    const handleSearch = () => {
        const params = { page: 1 };
        if (formFilters.staffName) params.staffName = formFilters.staffName;
        if (formFilters.date) params.date = formFilters.date;
        setSearchParams(params);
    };

    const changePage = (page) => {
        const params = Object.fromEntries([...searchParams]);
        params.page = page;
        setSearchParams(params);
    };

    return (
        <div className="p-4 text-gray-900 w-full min-h-screen bg-gray-50/30">

            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                        <Activity size={20} /> Nhật ký hoạt động
                    </h1>
                    <p className="text-gray-400 text-xs font-medium">Theo dõi hoạt động của hệ thống và nhân viên</p>
                </div>
            </header>

            {/* FILTER SECTION */}
            <div className="flex flex-wrap items-end gap-3 mb-6 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="w-64">
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1">
                        <User size={12} /> Tên nhân viên
                    </label>
                    <input
                        type="text"
                        name="staffName"
                        value={formFilters.staffName}
                        onChange={handleInputChange}
                        placeholder="Nhập tên..."
                        className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                </div>

                <div className="w-48">
                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Ngày
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formFilters.date}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-black outline-none transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-black text-white px-6 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                    >
                        <Search size={16} /> Lọc
                    </button>

                    {(currentStaffName || currentDate) && (
                        <button
                            onClick={() => {
                                setFormFilters({ staffName: "", date: "" });
                                setSearchParams({});
                            }}
                            className="bg-gray-100 text-gray-600 px-3 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* DATA TABLE */}
            <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 font-bold uppercase text-gray-400 text-[10px]">Nhân viên</th>
                                <th className="px-4 py-3 font-bold uppercase text-gray-400 text-[10px]">Hành động</th>
                                <th className="px-4 py-3 font-bold uppercase text-gray-400 text-[10px]">Cấp độ</th>
                                <th className="px-4 py-3 font-bold uppercase text-gray-400 text-[10px]">Thông điệp</th>
                                <th className="px-4 py-3 font-bold uppercase text-gray-400 text-[10px]">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr
                                        key={log._id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-default"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-black">{log.actorId?.name || "Hệ thống"}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200 uppercase">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${log.level === 'ERROR' ? 'bg-red-50 text-red-600' :
                                                log.level === 'WARN' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {log.level}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 max-w-sm truncate italic">{log.message}</td>
                                        <td className="px-4 py-3 text-gray-400 tabular-nums">
                                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400 uppercase tracking-widest text-[10px] font-bold">
                                        Không tìm thấy nhật ký nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-500 font-medium">
                        Trang <span className="text-black font-bold">{currentPage}</span> / {totalPages}
                    </p>
                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => changePage(i + 1)}
                                className={`w-8 h-8 rounded text-xs font-black transition-all ${currentPage === i + 1
                                    ? "bg-black text-white shadow-md"
                                    : "text-gray-400 hover:bg-gray-100 hover:text-black"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}