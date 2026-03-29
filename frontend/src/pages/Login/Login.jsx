import { useState, useEffect } from "react";
import { loginApi } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-toastify"; // thêm

export default function Login() {
    const { login, token } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (token) {
            navigate("/pos", { replace: true });
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await loginApi(form);
            const { user, token: newToken } = res.data;

            if (!newToken) {
                toast.error("Hệ thống không trả về token!");
                return;
            }

            
            if (user.role === "admin") {
                toast.error("Admin không được phép đăng nhập ở đây");
                setLoading(false);
                return;
            }

            // User bình thường thì login
            login(user, newToken);
            localStorage.setItem("token", newToken);
            localStorage.setItem("branchId", user.branchId);

            toast.success("Đăng nhập thành công");

        } catch (err) {

            if (err.response?.status === 401) {
                toast.error("Email hoặc mật khẩu không chính xác");
            } else {
                toast.error("Có lỗi xảy ra, vui lòng thử lại");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-white/20 backdrop-blur-sm">

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                        Chào mừng!
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Vui lòng đăng nhập vào tài khoản của bạn
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    {/* Email */}
                    <div className="relative group">
                        <label className="text-sm font-semibold text-gray-600 ml-1">
                            Email
                        </label>

                        <div className="relative mt-1">
                            <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />

                            <input
                                name="email"
                                type="email"
                                required
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="relative group">

                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-gray-600">
                                Mật khẩu
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-xs font-bold text-blue-600 hover:text-blue-800"
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <div className="relative mt-1">
                            <Lock
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />

                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Đang xử lý...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}