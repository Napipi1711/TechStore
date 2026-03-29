import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import branchApi from "../../api/branchApi";
import accountApi from "../../api/accountApi";

export default function CreateBranch() {
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        managerId: "", 
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Load danh sách user để chọn làm Manager
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await accountApi.getAll();
                // Chỉ lấy những user active để đảm bảo có thể quản lý chi nhánh
                const activeUsers = res.data?.users?.filter((u) => u.isActive) || [];
                setUsers(activeUsers);
            } catch (err) {
                console.error("Lỗi lấy danh sách user:", err);
            }
        };
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Backend mới nhận managerId để tạo quan hệ trong UserBranch
            const payload = {
                ...formData,
                managerId: formData.managerId || null
            };

            await branchApi.create(payload);
            alert("Tạo chi nhánh và thiết lập quản lý thành công!");
            navigate("/branches");
        } catch (err) {
            // Hiển thị lỗi chi tiết từ Backend (ví dụ: Code trùng, hoặc User đã là manager nơi khác)
            const errorMsg = err.response?.data?.message || "Có lỗi xảy ra";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm mt-10 border border-slate-100">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Thêm chi nhánh mới</h2>
                <p className="text-slate-500 text-sm">Thiết lập thông tin cơ bản và người quản lý trực tiếp.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Mã chi nhánh <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="VD: CN_HANOI_01"
                            className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-slate-700">Tên chi nhánh <span className="text-red-500">*</span></label>
                        <input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="VD: Chi nhánh Cầu Giấy"
                            className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition bg-slate-50/50"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">
                        Quản lý chi nhánh
                    </label>
                    <select
                        name="managerId"
                        value={formData.managerId}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition cursor-pointer"
                    >
                        <option value="">-- Chưa bổ nhiệm quản lý --</option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.name} — {u.email}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-400 italic">Hệ thống sẽ tự động cấp quyền <strong>Branch Manager</strong> cho nhân sự này.</p>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Địa chỉ <span className="text-red-500">*</span></label>
                    <input
                        required
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Số nhà, tên đường, phường/xã..."
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Số điện thoại liên hệ</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Số điện thoại chi nhánh"
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                </div>

                <div className="flex gap-3 pt-6 border-t mt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition shadow-md active:transform active:scale-95 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Đang tạo..." : "Xác nhận tạo chi nhánh"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/branches")}
                        className="px-6 py-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}