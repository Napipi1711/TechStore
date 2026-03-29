import { Loader2, CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * UI Loading + Success + Auto Redirect
 * @param {boolean} loading
 * @param {boolean} success
 * @param {string} redirectTo
 * @param {number} delay
 * @param {string} message
 */
const DeplayWeb = ({
  loading,
  success,
  redirectTo,
  delay = 2000,
  message = "Tạo thành công "
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate(redirectTo);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [success, navigate, redirectTo, delay]);

  if (!loading && !success) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-xl">
        {loading && (
          <>
            <Loader2 size={40} className="animate-spin text-slate-900" />
            <p className="font-bold text-slate-700">Đang xử lý...</p>
          </>
        )}

        {success && (
          <>
            <CheckCircle size={40} className="text-green-500" />
            <p className="font-bold text-green-600">{message}</p>
            <p className="text-xs text-slate-400">Đang chuyển trang...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DeplayWeb;
