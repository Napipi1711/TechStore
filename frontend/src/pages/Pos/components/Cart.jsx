import { useState } from "react";
import { Banknote, QrCode, ChevronRight, UserCheck } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getCustomerByPhoneApi } from "../../../api/customerApi";

export default function Cart({ cartItems, setCartItems, handleCheckout }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerInfo, setCustomerInfo] = useState(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);

  // Tăng giảm số lượng
  const increaseQty = (id) => {
    if (loading) return;
    setCartItems(prev =>
      prev.map(item => {
        if (item._id === id) {
          const totalQty = item.quantity + 1;
          if (totalQty > item.stock) {
            return item; // không toast
          }
          return { ...item, quantity: totalQty };
        }
        return item;
      })
    );
  };

  const decreaseQty = (id) => {
    setCartItems(prev =>
      prev
        .map(item => item._id === id ? { ...item, quantity: item.quantity - 1 } : item)
        .filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;
    setCartItems([]);
    sessionStorage.removeItem("cart");
    // bỏ toast
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkCustomer = async () => {
    if (!customerPhone) {
      return; // bỏ toast
    }
    setCheckingCustomer(true);
    try {
      const res = await getCustomerByPhoneApi(customerPhone);
      if (res.data && res.data.customer) {
        setCustomerInfo(res.data.customer);
      } else {
        setCustomerInfo(null);
      }
    } catch (err) {
      console.error("Customer API error:", err);
      setCustomerInfo(null);
    } finally {
      setCheckingCustomer(false);
    }
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    if (!customerPhone) {
      return; // bỏ toast
    }
    setShowConfirm(true);
  };

  const onCheckout = async (method) => {
    if (!customerInfo || !customerInfo._id) {
      return; // bỏ toast
    }

    setShowConfirm(false);
    setLoading(true);

    try {
      await handleCheckout(method, customerInfo._id);
      setCartItems([]);
      sessionStorage.removeItem("cart");
      setCustomerPhone("");
      setCustomerInfo(null);
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden relative bg-white border-l font-sans">

      {/* HEADER */}
      <div className="p-5 border-b flex-none">
        <h2 className="text-lg font-black text-gray-800 text-center uppercase tracking-[0.2em]">
          Giỏ Hàng
        </h2>
      </div>

      {/* INPUT SỐ ĐIỆN THOẠI */}
      <div className="p-4 border-b flex gap-2 items-center">
        <input
          type="text"
          placeholder="Nhập số điện thoại khách"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="flex-1 border rounded-lg p-2 text-sm outline-none focus:border-black transition-all"
        />
        <button
          onClick={checkCustomer}
          disabled={checkingCustomer}
          className="bg-gray-900 text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-black transition-colors disabled:bg-gray-400"
        >
          {checkingCustomer ? "Đang check..." : "Kiểm tra"}
        </button>
      </div>

      {/* HIỂN THỊ THÔNG TIN KHÁCH HÀNG */}
      {customerInfo && (
        <div className="p-4 border-b border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 shadow-sm">
              <UserCheck className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h4 className="text-[14px] font-black text-gray-900 uppercase tracking-tight truncate">
                  {customerInfo.name}
                </h4>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100 uppercase">
                  Thành viên
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-[12px] text-gray-600 font-medium italic">
                  {customerInfo.phone}
                </p>
                <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                  {customerInfo.address || "Chưa cập nhật địa chỉ"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART LIST */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {cartItems.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-sm font-bold uppercase tracking-widest">Giỏ hàng trống</p>
            <p className="text-xs">Chọn sản phẩm để bắt đầu bán</p>
          </div>
        )}

        {cartItems.map(item => (
          <div key={item._id} className="grid grid-cols-12 items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="col-span-5 min-w-0">
              <p className="font-bold text-gray-700 text-[13px] truncate">{item.name}</p>
              <p className="text-[11px] text-blue-600 font-bold">${item.price.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-medium underline underline-offset-4 decoration-gray-200">
                Kho: {item.stock}
              </p>
            </div>

            <div className="col-span-4 flex justify-center">
              <div className="flex items-center bg-white border rounded-lg h-7 overflow-hidden">
                <button
                  onClick={() => decreaseQty(item._id)}
                  className="w-7 h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >−</button>
                <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                <button
                  onClick={() => increaseQty(item._id)}
                  className="w-7 h-full flex items-center justify-center bg-gray-900 text-white disabled:bg-gray-200"
                  disabled={loading || item.quantity >= item.stock}
                >+</button>
              </div>
            </div>

            <div className="col-span-3 text-right font-black text-[13px] text-gray-800">
              ${(item.price * item.quantity).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-5 border-t border-dashed flex-none bg-white">
        <div className="flex justify-between mb-4 items-end">
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Tổng cộng</span>
          <span className="text-3xl font-black text-gray-900 leading-none">${total.toLocaleString()}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={clearCart}
            disabled={cartItems.length === 0 || loading}
            className="flex-1 border-2 border-gray-100 font-bold py-3 rounded-xl text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-50 transition-all uppercase tracking-tighter"
          >
            Xóa hết
          </button>
          <button
            onClick={handleCheckoutClick}
            disabled={cartItems.length === 0 || loading}
            className="flex-[2] bg-gray-900 text-white font-black py-3 rounded-xl text-xs hover:bg-black disabled:bg-gray-200 transition-all shadow-lg shadow-gray-100 uppercase tracking-widest"
          >
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>

      {/* POPUP THANH TOÁN */}
      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-end justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-2xl shadow-2xl p-6 mb-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Hình thức thanh toán</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Chọn phương thức phù hợp để hoàn tất.</p>
            <div className="space-y-3">
              <button
                onClick={() => onCheckout("cash")}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-50 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    <Banknote className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </div>
                  <span className="font-bold text-gray-700">Tiền mặt</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
              </button>
              <button
                onClick={() => onCheckout("qr")}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 border-2 border-gray-50 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                    <QrCode className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                  </div>
                  <span className="font-bold text-gray-700">Chuyển khoản / VietQR</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-900" />
              </button>
            </div>
            <button
              onClick={() => setShowConfirm(false)}
              className="mt-6 w-full text-center text-xs font-black text-gray-400 hover:text-black transition-colors py-2 uppercase tracking-widest"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}