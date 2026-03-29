import { useState } from "react";
import { forgotPasswordApi } from "../../api/authApi";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // Trạng thái đã gửi thành công
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPasswordApi({ email });
      setIsSubmitted(true); // Kích hoạt animation thành công
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 overflow-hidden relative">
      {/* Background Decor - Tạo vài đốm màu ảo diệu */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-10">

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              // FORM NHẬP EMAIL
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Quên mật khẩu?
                  </h2>

                </div>

                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Gửi email khôi phục"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              // GIAO DIỆN THÀNH CÔNG
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="flex justify-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="text-green-500" size={40} />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Kiểm tra Email</h2>
                <p className="text-gray-500 mt-3 leading-relaxed">
                  Chúng tôi đã gửi một link khôi phục mật khẩu đến <br />
                  <span className="font-semibold text-gray-800">{email}</span>
                </p>
                <motion.button
                  whileHover={{ x: -5 }}
                  onClick={() => setIsSubmitted(false)}
                  className="mt-8 text-sm text-gray-400 hover:text-blue-600 font-medium flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft size={16} /> Thử lại với email khác
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSubmitted && (
            <div className="text-center mt-8 pt-6 border-t border-gray-50">
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}