import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import purchaseApi from "../../api/purchaseApi";

export default function Returns({ purchaseId, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [purchase, setPurchase] = useState(null);

    // Lấy chi tiết purchase
    useEffect(() => {
        if (!purchaseId) return;

        const fetchPurchase = async () => {
            try {
                const res = await purchaseApi.getById(purchaseId);
                const p = res?.data?.data;
                setPurchase(p || null);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load purchase details");
            }
        };

        fetchPurchase();
    }, [purchaseId]);

    const handleReturn = async () => {
        setLoading(true);
        try {
            // Gọi API return toàn bộ sản phẩm
            await purchaseApi.returnPurchase(purchaseId);
            toast.success("All products returned successfully");
            onSuccess?.();
            onClose?.();
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Return failed");
        } finally {
            setLoading(false);
        }
    };

    if (!purchase) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Return Purchase</h2>
                <p className="text-gray-600 mb-4">
                    All products in this purchase will be returned in full quantity.
                </p>

                <div className="mb-4">
                    <p className="font-medium">Purchase ID:</p>
                    <p className="text-gray-700">{purchase._id}</p>

                    <p className="font-medium mt-2">Supplier:</p>
                    <p className="text-gray-700">{purchase.supplierId?.name || "-"}</p>

                    <p className="font-medium mt-2">Branch:</p>
                    <p className="text-gray-700">{purchase.branchId?.name || "-"}</p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleReturn}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Return All"}
                    </button>
                </div>
            </div>
        </div>
    );
}