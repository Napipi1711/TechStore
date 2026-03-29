import { useNavigate, useLocation } from "react-router-dom";
import { checkoutPosApi } from "../../../api/posApi";
import { useState } from "react";
import { toast } from "react-toastify"; // ← import toast

const ConfirmPayment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const cart = location.state?.cartItems || [];
    const paymentMethod = location.state?.paymentMethod || "cash";
    const customerInfo = location.state?.customerInfo || null;

    const subTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const discount = 0;
    const grandTotal = subTotal - discount;

    const confirmPayment = async () => {
        if (loading) return;

        if (!customerInfo?.phone) {
            toast.warn("Vui lòng nhập số điện thoại khách hàng trước khi thanh toán!");
            return;
        }

        setLoading(true);

        try {
            const data = {
                paymentMethod: paymentMethod.toLowerCase(),
                customerId: customerInfo?._id || null,
                customerPhone: customerInfo?.phone || "",
                customerName: customerInfo?.name || "",
                items: cart.map(i => ({
                    productId: i._id,
                    qty: i.quantity,
                    price: i.price,
                    costPrice: i.costPrice || 0,
                }))
            };

            console.log("==== Checkout POS Request Body ====", data, "===================================");

            const res = await checkoutPosApi(data);

            if (res.data.saleId) {
                // Clear cart
                sessionStorage.removeItem("cart");

                // Clear customer info
                location.state.customerInfo = null;

                if (res.data.paymentMethod === "qr") {
                    navigate("/pos/qr-payment", {
                        state: { qr: res.data.qr, saleId: res.data.saleId }
                    });
                } else {
                    toast.success("Thanh toán thành công!");
                    navigate("/pos");
                }
            }

        } catch (err) {
            console.error("CHECKOUT ERROR:", err.response?.data || err.message);
            toast.error("Thanh toán thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Confirm Payment</h2>

            {cart.map(item => (
                <div key={item._id}>
                    {item.name} x {item.quantity} = ${item.price * item.quantity}
                </div>
            ))}

            <div className="mt-4">Subtotal: ${subTotal}</div>
            <div>Payment method: {paymentMethod}</div>
            <div className="font-bold">Total: ${grandTotal}</div>

            <div className="mt-4 text-sm text-gray-600">
                Khách hàng: {customerInfo ? `${customerInfo.name} (${customerInfo.phone})` : "Chưa chọn"}
            </div>

            <button
                onClick={confirmPayment}
                disabled={loading || cart.length === 0}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? "Processing..." : "Confirm Payment"}
            </button>
        </div>
    );
};

export default ConfirmPayment;