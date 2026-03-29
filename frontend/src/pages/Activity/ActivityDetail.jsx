import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, User, CreditCard, Package } from "lucide-react";
import activityApi from "../../api/activityApi";

export default function ActivityDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await activityApi.getDetail(id);
      setData(res.data.data || null);
    } catch (error) {
      console.error("Fetch log detail error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString('vi-VN');
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Đang tải...</div>;
  if (!data) return <div className="p-4 text-center text-red-500 font-medium">Không tìm thấy dữ liệu</div>;

  const { log, sale, saleDetails } = data;

  return (
    <div className="p-4 text-gray-800 w-full">
      {/* 🔙 Back Button */}
      <div className="mb-4">
        <Link to="/activity" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium">
          <ArrowLeft size={18} />
          Quay lại
        </Link>
      </div>

      {/* Grid hệ thống */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

        {/* THÔNG TIN CHUNG (Nhân viên) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold mb-4 border-b pb-2 text-sm uppercase">
              <User size={16} /> Nhân viên
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Họ tên</p>
                <p className="font-semibold">{log.actorId?.name || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Hành động</p>
                <span className="inline-block px-2 py-0.5 rounded bg-black text-white text-[10px] font-bold mt-1">
                  {log.action}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Thời gian</p>
                <p className="text-sm">{formatDateTime(log.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CHI TIẾT GIAO DỊCH */}
        <div className="lg:col-span-3 space-y-4">
          {sale && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="flex items-center gap-2 font-bold text-gray-900">
                  <CreditCard size={17} /> Giao dịch: <span className="text-blue-600">#{sale.saleCode}</span>
                </h2>
                <div className="flex gap-4">
                  <span className="text-sm">Thanh toán: <b>{sale.paymentMethod}</b></span>
                  <span className="text-sm font-bold text-green-600">{sale.status}</span>
                </div>
              </div>

              {/* BẢNG SẢN PHẨM */}
              {saleDetails && saleDetails.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 font-bold text-[10px] text-gray-500 uppercase">Sản phẩm</th>
                        <th className="px-4 py-2 font-bold text-[10px] text-gray-500 uppercase text-center">SL</th>
                        <th className="px-4 py-2 font-bold text-[10px] text-gray-500 uppercase text-right">Đơn giá</th>
                        <th className="px-4 py-2 font-bold text-[10px] text-gray-500 uppercase text-right">Thành tiền</th>
                        <th className="px-4 py-2 font-bold text-[10px] text-gray-500 uppercase text-right text-blue-600">Lợi nhuận</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {saleDetails.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2 font-medium">
                            <div className="flex items-center gap-2">
                              <Package size={12} className="text-gray-400" />
                              {item.productId?.name || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.price?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-bold">${item.lineTotal?.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right text-blue-600 font-bold">${item.profitAmount?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}