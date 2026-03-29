import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, CheckCircle2 } from "lucide-react";
import purchaseApi from "../../api/purchaseApi";

const formatDate = (date) => (date ? new Date(date).toLocaleString("vi-VN") : "Chưa");

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await purchaseApi.getById(id);
        const data = res?.data?.data || res?.data;
        setPurchase(data);
      } catch (error) {
        console.error("fetchDetail error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!purchase) return <NotFound />;

  const totalCost = purchase.items?.reduce(
    (sum, i) => sum + (i.quantity || 0) * (i.costPrice || 0),
    0
  );

  return (
    <div className="min-h-screen bg-white text-gray-800 pb-20">
      {/* Header navigation */}
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-100 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-gray-800 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
        >
          <Printer className="w-4 h-4" /> In phiếu
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="flex justify-between items-end border-b-4 border-gray-900 pb-8 mb-10">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Phiếu Nhập Kho</h1>
            <p className="text-sm text-gray-400 mt-2 font-mono">ID: {purchase._id}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${purchase.status === 'completed' ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-500'}`}>
              {purchase.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-20 mb-16">
          <div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em]">Nhà cung cấp</h2>
            <p className="text-xl font-bold mb-2">{purchase.supplierId?.name || "N/A"}</p>
            <div className="text-sm text-gray-500 space-y-1 leading-relaxed">
              <p>{purchase.supplierId?.phone}</p>
              <p>{purchase.supplierId?.email}</p>
              <p>{purchase.supplierId?.address}</p>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <h2 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em]">Thông tin vận hành</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-gray-50 pb-1">
                <span className="text-gray-400">Ngày lập:</span>
                <span className="font-bold">{new Date(purchase.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1">
                <span className="text-gray-400">Chi nhánh:</span>
                <span className="font-bold">{purchase.branchId?.name || "Chi nhánh chính"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-1">
                <span className="text-gray-400">Người phụ trách:</span>
                <span className="font-bold">{purchase.managerId?.name || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 w-12">#</th>
                <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest">Sản phẩm / SKU</th>
                <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest w-24">Số lượng</th>
                <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest w-32">Đơn giá</th>
                <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest w-40">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchase.items?.map((item, index) => (
                <tr key={item._id}>
                  <td className="py-6 text-xs text-gray-400 font-mono">
                    {(index + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="py-6">
                    <p className="font-bold text-gray-900 underline decoration-gray-200 underline-offset-4">{item.productId?.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                      SKU: {item.productId?.sku || "N/A"}
                    </p>
                  </td>
                  <td className="py-6 text-center font-bold">{item.quantity}</td>
                  <td className="py-6 text-right text-gray-500">${(item.costPrice || 0).toLocaleString()}</td>
                  <td className="py-6 text-right font-black">${((item.quantity || 0) * (item.costPrice || 0)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-900">
                <td colSpan="3" className="py-10 align-top">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Ghi chú</p>
                  <p className="text-sm italic text-gray-500 max-w-xs">{purchase.note || "Không có ghi chú."}</p>
                </td>
                <td colSpan="2" className="py-10 text-right align-top">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tổng thanh toán</p>
                  <p className="text-4xl font-black">${totalCost.toLocaleString()}</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>



        {/* Signature for print */}
        <div className="hidden print:flex justify-between mt-24 text-center">
          <div className="w-64">
            <p className="text-[10px] font-black uppercase mb-24 tracking-widest">Người lập phiếu</p>
            <div className="border-b border-black"></div>
            <p className="text-[10px] mt-2 text-gray-400">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="w-64">
            <p className="text-[10px] font-black uppercase mb-24 tracking-widest">Đại diện nhà cung cấp</p>
            <div className="border-b border-black"></div>
            <p className="text-[10px] mt-2 text-gray-400">(Ký và ghi rõ họ tên)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-10 text-center text-xs font-bold text-gray-400 uppercase animate-pulse">
      Đang tải...
    </div>
  );
}

function NotFound() {
  return (
    <div className="p-10 text-center text-sm font-bold">Không tìm thấy đơn hàng.</div>
  );
}