import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    const orderItems = location.state?.cartItems || [];
    const customerId = location.state?.customerId || null; // Lấy customerId từ Cart
    const [cash, setCash] = useState("");

    // Tính tổng tiền
    const total = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Tiền thối (nếu cash)
    const change = cash ? Number(cash) - total : 0;

    // Nếu mở payment trực tiếp mà không có đơn
    if (orderItems.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Không có đơn hàng để thanh toán</p>
                    <button
                        onClick={() => navigate("/pos")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Quay lại POS
                    </button>
                </div>
            </div>
        );
    }

    // Map nút sang enum backend
    const mapPaymentMethod = (method) => {
        if (method === "Cash") return "cash";
        if (method === "QR") return "qr";
        if (method === "Bank") return "visa";
        return "cash";
    };

    // Xử lý thanh toán
    const handlePayment = (method) => {
        const backendMethod = mapPaymentMethod(method);

        if (!customerId) {
            alert("Vui lòng chọn khách hàng trước khi thanh toán!");
            return;
        }

        if (backendMethod === "cash" && Number(cash) < total) {
            alert("Khách đưa chưa đủ tiền!");
            return;
        }

        navigate("/confirmpayment", {
            state: {
                cartItems: orderItems.map((i) => ({
                    productId: i._id,
                    qty: i.quantity,
                    price: i.price,
                    costPrice: i.costPrice || 0, // backend tính profit
                })),
                paymentMethod: backendMethod,
                customerId, // gửi customerId
                cashReceived: Number(cash),
                total,
            },
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="flex h-screen bg-gray-100">

            {/* Order list */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-xl font-black mb-6">Món đã chọn</h2>
                <div className="space-y-3">
                    {orderItems.map((item) => (
                        <div key={item._id} className="flex justify-between items-center py-3 border-b">
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-xs text-gray-400">
                                    ${item.price.toLocaleString()} x {item.quantity}
                                </p>
                            </div>
                            <div className="font-black">${(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment panel */}
            <div className="w-[340px] p-6 border-l bg-white flex flex-col">
                <h2 className="text-xl font-black mb-6">Thanh toán</h2>

                {/* Total */}
                <div className="flex justify-between mb-6 text-lg">
                    <span className="text-gray-500">Tổng tiền</span>
                    <span className="font-black text-2xl">${total.toLocaleString()}</span>
                </div>

                {/* Cash input */}
                <div className="mb-6">
                    <label className="text-xs text-gray-500">Khách đưa</label>
                    <input
                        type="number"
                        value={cash}
                        onChange={(e) => setCash(e.target.value)}
                        placeholder="Nhập số tiền"
                        className="w-full border rounded-lg p-3 mt-1"
                    />
                    {cash && (
                        <p className="text-sm mt-2 text-gray-600">
                            Tiền thối:
                            <span className="font-bold ml-2">${Math.max(change, 0).toLocaleString()}</span>
                        </p>
                    )}
                </div>

                {/* Payment buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => handlePayment("Cash")}
                        className="w-full border-2 border-black font-bold py-4 hover:bg-gray-50"
                    >
                        Cash
                    </button>

                    <button
                        onClick={() => handlePayment("QR")}
                        className="w-full border-2 border-black font-bold py-4 hover:bg-gray-50"
                    >
                        QR Payment
                    </button>

                    <button
                        onClick={() => handlePayment("Bank")}
                        className="w-full border-2 border-black font-bold py-4 hover:bg-gray-50"
                    >
                        Card Payment
                    </button>
                </div>

                {/* Back */}
                <button
                    onClick={handleBack}
                    className="mt-auto text-sm text-gray-400 hover:text-gray-600"
                >
                    ← Quay lại POS
                </button>
            </div>
        </div>
    );
}