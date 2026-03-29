import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPaymentStatusApi } from "../../../../api/posApi";
import { toast } from "react-toastify";

export default function QRPayment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { qr, saleId } = location.state || {}; // backend trả saleId, không phải paymentId

  const [isSuccess, setIsSuccess] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!saleId || isSuccess) return;

    setChecking(true);
    const interval = setInterval(async () => {
      try {
        const res = await getPaymentStatusApi(saleId); 
        if (res.data.status === "paid") {
          sessionStorage.removeItem("cart");
          clearInterval(interval);
          setIsSuccess(true);

         
          setTimeout(() => {
            navigate(`/invoices/invoice/${saleId}`, {
              state: {
                saleId,
                total: res.data.total,
                paymentMethod: res.data.paymentMethod,
              },
            });
          }, 3000); 
        }
      } catch (err) {
        console.error("Check payment error:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [saleId, navigate, isSuccess]);

  const cancelPayment = () => {
    navigate("/pos");
  };

  if (!qr) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Không có dữ liệu QR</p>
      </div>
    );
  }

  // --- GIAO DIỆN THÀNH CÔNG ---
  if (isSuccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-white transition-all duration-500">
        <div className="text-center">
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative flex items-center justify-center w-20 h-20 bg-green-500 rounded-full shadow-lg scale-up-center">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  className="checkmark-draw"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 animate-bounce">
            Thanh toán thành công!
          </h2>
          <p className="text-gray-500 mt-2">Đang quay lại màn hình POS...</p>
          <div className="w-48 h-1 bg-gray-100 mx-auto mt-6 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 animate-loading-bar"></div>
          </div>

          <style>{`
            .scale-up-center {
              animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
            }
            .checkmark-draw {
              stroke-dasharray: 50;
              stroke-dashoffset: 50;
              animation: draw 0.5s stroke-dashoffset 0.3s ease-in-out forwards;
            }
            @keyframes scale-up-center {
              0% { transform: scale(0.5); }
              100% { transform: scale(1); }
            }
            @keyframes draw {
              to { stroke-dashoffset: 0; }
            }
            @keyframes loading-bar {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            .animate-loading-bar {
              animation: loading-bar 3s linear forwards;
            }
          `}</style>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN QUÉT QR ---
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-[380px] border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Quét QR để thanh toán
        </h2>

        <div className="bg-slate-50 p-4 rounded-xl mb-4">
          <img
            src={qr}
            alt="QR Code"
            className="w-72 mx-auto rounded-lg shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-center items-center gap-2 text-blue-600 font-medium text-sm animate-pulse">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Chờ khách hàng thanh toán...
          </div>

          <button
            onClick={cancelPayment}
            className="mt-3 w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Hủy giao dịch
          </button>
        </div>
      </div>
    </div>
  );
}