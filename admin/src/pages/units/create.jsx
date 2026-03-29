import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import unitApi from "../../api/unitApi";

function UnitCreate() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        abbreviation: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        if (error) setError(""); // Xóa lỗi khi người dùng nhập lại
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setError("Tên đơn vị không được để trống");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await unitApi.create(form);
            navigate("/units");
        } catch (err) {
            console.error("CREATE UNIT ERROR:", err);
            setError(err.response?.data?.message || "Không thể tạo đơn vị. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* ================= HEADER ================= */}
            <button
                onClick={() => navigate("/units")}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors group"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Quay lại danh sách</span>
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Thêm đơn vị tính
                </h1>
                <p className="text-slate-500 mt-2">
                    Tạo các đơn vị đo lường mới cho hệ thống quản lý sản phẩm.
                </p>
            </div>

            {/* ================= FORM CARD ================= */}
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6"
            >
                {error && (
                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="grid gap-6">
                    {/* TITLE */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Tên đơn vị <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Ví dụ: Kilogram, Thùng, Cái..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                        />
                        <p className="text-xs text-slate-400 ml-1">Tên đầy đủ của đơn vị tính.</p>
                    </div>

                    {/* ABBREVIATION */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">
                            Viết tắt
                        </label>
                        <input
                            type="text"
                            name="abbreviation"
                            value={form.abbreviation}
                            onChange={handleChange}
                            placeholder="Ví dụ: kg, box, pcs..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 font-mono text-sm"
                        />
                        <p className="text-xs text-slate-400 ml-1">Mã ngắn để hiển thị nhanh trên hóa đơn/báo cáo.</p>
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate("/units")}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Hủy bỏ
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>Lưu đơn vị</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UnitCreate;