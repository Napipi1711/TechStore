import { useNavigate, useParams } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getInvoiceByIdApi } from "../../../api/invoiceApi";
import invoiceBill from "../../../utils/invoiceBill";

export default function InvoicePage() {
    const navigate = useNavigate();
    const { saleId } = useParams();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await getInvoiceByIdApi(saleId);
                const data = res.data;
                setInvoice(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (saleId) fetchInvoice();
    }, [saleId]);

    if (loading) return <div className="p-10 text-center">Đang tải hóa đơn...</div>;
    if (!invoice)
        return (
            <div className="p-10 text-center">
                <p>Không tìm thấy hóa đơn</p>
                <button onClick={() => navigate("/pos")} className="mt-4 bg-black text-white px-4 py-2 rounded">
                    Quay lại POS
                </button>
            </div>
        );

    const staff = invoice.staff || {};
    const customer = invoice.customer || {};
    const branch = invoice.branch || {};
    const details = invoice.products || [];

    // Tính tổng nếu API không trả total
    const total = details.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* HEADER ACTIONS */}
            <div className="flex justify-between items-center mb-6 print:hidden">
                <button onClick={() => navigate("/pos")} className="flex items-center text-sm text-gray-500 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                </button>

                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="border px-4 py-2 text-sm rounded">
                        <Printer className="inline w-4 h-4 mr-1" /> In hóa đơn
                    </button>
                    <invoiceBill sale={invoice} details={details} />
                </div>
            </div>

            {/* INVOICE LAYOUT */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
                {/* COMPANY HEADER */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-black uppercase">TechStore Transaction bill</h2>
                        <p className="text-sm text-gray-500">Global Premium Service</p>
                        <p className="text-sm text-gray-500">Address: 123 Digital Ave, Silicon District, NY</p>
                        <p className="text-sm text-gray-500">Hotline: +1 800-TECH-STORE - Website: www.tech-store.com</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-gray-500 font-bold uppercase">Invoice</h3>
                        <p className="text-sm">Code: {invoice.saleCode || "-"}</p>
                        <p className="text-sm">Date: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</p>
                    </div>
                </div>

                {/* CUSTOMER & TRANSACTION INFO */}
                <div className="flex justify-between mb-6 border-t border-b py-4 text-sm">
                    <div className="w-1/2 pr-4">
                        <h4 className="font-bold mb-2">Customer Information</h4>
                        <p>Name: {customer.name || "-"}</p>
                        <p>Phone: {customer.phone || "-"}</p>
                        <p>Shipping Address: {customer.address || "-"}</p>
                    </div>
                    <div className="w-1/2 pl-4">
                        <h4 className="font-bold mb-2">Transaction Details</h4>
                        <p>Payment Method: {invoice.paymentMethod || "-"}</p>
                        <p>Payment Date: {invoice.paidAt ? new Date(invoice.paidAt).toLocaleString() : "-"}</p>
                        <p>Sales Associate: {staff.name || "-"}</p>
                    </div>
                </div>

                {/* PRODUCTS TABLE */}
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-gray-900 text-white">
                        <tr>
                            <th className="p-2 border">No.</th>
                            <th className="p-2 border">Product / Component</th>
                            <th className="p-2 border">Qty</th>
                            <th className="p-2 border">Unit Price</th>
                            <th className="p-2 border text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((item, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2 border">{index + 1}</td>
                                <td className="p-2 border">{item.name}</td>
                                <td className="p-2 border">{item.quantity}</td>
                                <td className="p-2 border">${item.price.toLocaleString()}</td>
                                <td className="p-2 border text-right">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTALS */}
                <div className="mt-4 flex justify-end flex-col gap-1 text-right text-sm">
                    <p>Subtotal: ${total.toLocaleString()}</p>
                    <p className="text-lg font-black">GRAND TOTAL: ${total.toLocaleString()}</p>
                </div>

                {/* WARRANTY / FOOTER */}
                <div className="mt-6 p-4 bg-gray-50 text-xs">
                    <h4 className="font-bold mb-2">Warranty Policy & Terms:</h4>
                    <ul className="list-disc pl-5">
                        <li>Warranty Period: 24 months for main unit, 06 months for accessories.</li>
                        <li>Replacement: 1-for-1 exchange within 30 days for manufacturer defects.</li>
                        <li>Void Warranty: Damaged seals, physical damage, liquid ingress, unauthorized repair.</li>
                        <li>This invoice serves as your official warranty certificate. Please keep it for future reference.</li>
                    </ul>
                </div>

                {/* SIGNATURES */}
                <div className="mt-6 flex justify-between text-xs">
                    <div>
                        <p>Customer Signature</p>
                        <p>(Signed and dated)</p>
                    </div>
                    <div>
                        <p>Authorized Signature</p>
                        <p>(For TechStore Electronics)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}