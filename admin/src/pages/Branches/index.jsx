import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Không cần useSearchParams nữa
import branchApi from "../../api/branchApi";
import { Plus, Edit, Trash2, Eye, MapPin, Phone, User, Store } from "lucide-react";

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Hàm lấy danh sách chi nhánh (luôn lấy tất cả)
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await branchApi.getAll();
      setBranches(res.data.branches);
    } catch (err) {
      console.error("Lỗi khi tải danh sách chi nhánh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Chi nhánh</h1>
          <p className="text-slate-500 mt-1">Quản lý danh sách các cơ sở</p>
        </div>
        <Link
          to="/branches/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> Thêm mới
        </Link>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium animate-pulse">Đang tải dữ liệu chi nhánh...</p>
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Store className="mx-auto text-slate-200 mb-4" size={64} />
          <p className="text-slate-500 font-semibold text-lg">Không tìm thấy chi nhánh nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard key={branch._id} branch={branch} />
          ))}
        </div>
      )}
    </div>
  );
}

// Các component con (BranchCard, ActionBtn) giữ nguyên như cũ
function BranchCard({ branch }) {
  const statusStyles = branch.isActive
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className={`group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 ${!branch.isActive ? "opacity-70 grayscale-[0.3]" : ""}`}>
      <div className="flex justify-between items-start mb-5">
        <div className="space-y-1">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded italic">
            #{branch.code}
          </span>
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {branch.name}
          </h3>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${statusStyles}`}>
          {branch.isActive ? "Hoạt động" : "Tạm nghỉ"}
        </span>
      </div>

      <div className="space-y-4 text-[13px] mb-6">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-blue-50 rounded-lg shrink-0">
            <MapPin size={16} className="text-blue-500" />
          </div>
          <div>
            <span className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">Địa chỉ:</span>
            <span className="text-slate-500 line-clamp-2 leading-relaxed">{branch.address}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-emerald-50 rounded-lg shrink-0">
            <Phone size={16} className="text-emerald-500" />
          </div>
          <div>
            <span className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">Số Hotline:</span>
            <span className="text-slate-500 font-medium">{branch.phone || "---"}</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-purple-50 rounded-lg shrink-0">
            <User size={16} className="text-purple-500" />
          </div>
          <div>
            <span className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">Người quản lý:</span>
            <span className="text-slate-800 font-semibold">{branch.manager?.name || "Chưa gán quản lý"}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
        <ActionBtn to={`/branches/view/${branch._id}`} icon={<Eye size={18} />} label="Xem" color="hover:text-blue-600 hover:bg-blue-50" />
        <ActionBtn to={`/branches/update/${branch._id}`} icon={<Edit size={18} />} label="Sửa" color="hover:text-amber-600 hover:bg-amber-50" />
        <ActionBtn to={`/branches/delete/${branch._id}`} icon={<Trash2 size={18} />} label="Xóa" color="hover:text-red-600 hover:bg-red-50" />
      </div>
    </div>
  );
}

function ActionBtn({ to, icon, color, label }) {
  return (
    <Link
      to={to}
      className={`flex-1 flex flex-col items-center justify-center py-2 text-slate-400 rounded-xl transition-all gap-1 ${color}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </Link>
  );
}