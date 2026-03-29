import { useEffect, useState } from "react";
import { Plus, Package, Loader2, Search } from "lucide-react"; // Thêm icon
import { Link } from "react-router-dom";
import unitApi from "../../api/unitApi";

function UnitIndex() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUnits(); }, []);

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const res = await unitApi.getAll();
            // Fix logic nhận data ở đây
            const result = Array.isArray(res.data) ? res.data : res.data?.units || [];
            setUnits(result);
        } catch (err) {
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* ================= HEADER ================= */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Quản lý Đơn vị tính
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Hệ thống hiện có <span className="font-semibold text-indigo-600">{units.length}</span> đơn vị khả dụng
                    </p>
                </div>

                <Link
                    to="/units/create"
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200 font-medium no-underline"
                >
                    <Plus size={20} />
                    <span>Thêm đơn vị mới</span>
                </Link>
            </div>

            {/* ================= TABLE CARD ================= */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/2">Tên đơn vị</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Viết tắt</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="py-20">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
                                            <p>Đang tải dữ liệu...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : units.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="py-20">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Package className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-lg font-medium">Chưa có dữ liệu</p>
                                            <p className="text-sm">Bấm "Thêm đơn vị" để bắt đầu</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                units.map((unit) => (
                                    <tr key={unit._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                {unit.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono">
                                                {unit.abbreviation || "N/A"}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${unit.isActive
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-500"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${unit.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {unit.isActive ? "Đang hoạt động" : "Tạm ẩn"}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default UnitIndex;