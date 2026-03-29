import { useNavigate, useParams } from "react-router-dom";
import branchApi from "../../api/branchApi";
import { Trash2, AlertCircle } from "lucide-react";

export default function DeleteBranch() {
    const { id } = useParams();
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await branchApi.remove(id);
            alert("Đã xóa chi nhánh thành công!");
            navigate("/branches");
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi xóa chi nhánh");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 size={40} />
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Xác nhận xóa?</h2>
                <p className="text-slate-500 text-center mb-8">
                    Bạn đang thực hiện xóa vĩnh viễn chi nhánh này. Dữ liệu sẽ <span className="text-red-600 font-bold">không thể khôi phục</span>. Các nhân viên thuộc chi nhánh sẽ được đưa về trạng thái tự do.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/branches")}
                        className="flex-1 px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition-all"
                    >
                        Xác nhận xóa
                    </button>
                </div>
            </div>
        </div>
    );
}