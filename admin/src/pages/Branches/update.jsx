import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import branchApi from "../../api/branchApi";
import accountApi from "../../api/accountApi";
import { Save, ArrowLeft, Loader2, Lock, AlertCircle, Edit3 } from "lucide-react";

export default function UpdateBranch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    managerId: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Trạng thái khi đang bấm Save
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [branchRes, userRes] = await Promise.all([
          branchApi.getById(id),
          accountApi.getAll(),
        ]);

        // Backend trả về branch object kèm manager (object)
        const branchData = branchRes.data;

        setFormData({
          name: branchData.name || "",
          code: branchData.code || "",
          address: branchData.address || "",
          phone: branchData.phone || "",
          managerId: branchData.manager?._id || "", // Chuyển từ object sang ID để khớp với <select>
        });

        const activeUsers = userRes.data?.users?.filter((u) => u.isActive) || [];
        setUsers(activeUsers);
      } catch (err) {
        console.error("Lỗi load branch:", err);
        setError("Không thể tải thông tin chi nhánh.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await branchApi.update(id, formData);
      // Bạn có thể dùng một library như react-hot-toast thay cho alert để xịn hơn
      alert("Cập nhật chi nhánh thành công!");
      navigate("/branches");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Lỗi cập nhật dữ liệu";
      setError(msg);
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-medium animate-pulse">Đang lấy dữ liệu chi nhánh...</p>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fadeIn">
      <button
        onClick={() => navigate("/branches")}
        className="flex items-center text-slate-500 hover:text-blue-600 mb-6 font-semibold transition-colors group"
      >
        <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Quay lại danh sách
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">
              Cập nhật chi nhánh
            </h2>
            <p className="text-sm text-slate-500">
              Chỉnh sửa thông tin vận hành và nhân sự quản lý
            </p>
          </div>
          <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
            <Edit3 size={24} /> {/* Bạn có thể import thêm icon Edit3 */}
          </div>
        </div>

        {error && (
          <div className="m-6 mb-0 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code - Read Only */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Mã chi nhánh</label>
              <div className="relative group">
                <input
                  readOnly
                  value={formData.code}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-500 font-mono cursor-not-allowed"
                />
                <Lock className="absolute right-4 top-3.5 text-slate-400" size={16} />
              </div>
              <p className="text-[11px] text-slate-400 ml-1 italic">* Mã chi nhánh là định danh duy nhất, không thể sửa đổi.</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Tên chi nhánh *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Chi nhánh Quận 7"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Manager Select */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Quản lý trực tiếp *</label>
            <select
              required
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all appearance-none"
            >
              <option value="">-- Click để chọn quản lý mới --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Địa chỉ hoạt động *</label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Số điện thoại</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Số điện thoại liên hệ"
                className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 ${submitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/branches")}
              className="px-8 py-3.5 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}