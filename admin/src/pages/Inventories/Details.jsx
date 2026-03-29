import { useEffect, useState } from "react";
import inventoriesApi from "../../api/inventoriesApi.js";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Details({ isOpen, onClose, data }) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && data?.branchId && data?.productId) {
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const res = await inventoriesApi.getDetails(data.branchId, data.productId);
          const formattedData = res.data.data.map(item => ({
            ...item,
            dateLabel: new Date(item.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })
          }));
          setDetails(formattedData);
        } catch (err) {
          console.error("Lỗi khi lấy chi tiết lô hàng:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b flex justify-between items-center bg-white">
          <div>
            <h3 className="text-xl font-black text-gray-900 leading-none">Phân tích lô hàng</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">
              <span className="text-blue-600 font-bold">{data?.productName}</span> — {data?.branchName}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800 transition-colors text-3xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-8">

              {/* --- BIỂU ĐỒ LÔ HÀNG --- */}
              {details.length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-[0.2em]">Biểu đồ đối chiếu số lượng</h4>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={details} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        {/* Đường lưới đậm hơn một chút để dễ căn tọa độ */}
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#cbd5e1" />
                        <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.2)', fontWeight: 'bold' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="rect" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px', fontWeight: 'bold' }} />

                        {/* CẬP NHẬT MÀU SẮC TẠI ĐÂY */}
                        <Bar
                          name="Số lượng gốc"
                          dataKey="originalQty"
                          fill="#f59e0b" /* Vàng hổ phách - Rất nổi bật */
                          radius={[4, 4, 0, 0]}
                          barSize={24}
                        />
                        <Bar
                          name="Hiện tồn"
                          dataKey="remainingQty"
                          fill="#1d4ed8" /* Xanh Blue đậm - Sắc nét */
                          radius={[4, 4, 0, 0]}
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* --- BẢNG CHI TIẾT --- */}
              <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 text-[10px] uppercase font-black border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4 tracking-widest">Ngày nhập kho</th>
                      <th className="px-4 py-4 text-center">Gốc</th>
                      <th className="px-4 py-4 text-center text-blue-700 font-black">Hiện tồn</th>
                      <th className="px-5 py-4 text-right">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {details.length > 0 ? (
                      details.map((lot) => (
                        <tr key={lot._id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-5 py-4 text-slate-700 font-bold">
                            {new Date(lot.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-4 text-center text-slate-400 font-medium">
                            {lot.originalQty}
                          </td>
                          <td className="px-4 py-4 text-center font-black text-slate-900 text-base">
                            {lot.remainingQty}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {lot.remainingQty > 0 ? (
                              <div className="flex justify-end items-center gap-2">
                                <span className="text-[11px] font-black text-emerald-600 uppercase">Còn hàng</span>
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded font-black uppercase">Đã hết</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-5 py-10 text-center text-slate-400 italic font-medium">Không tìm thấy dữ liệu lô hàng nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 text-sm font-black text-white bg-slate-900 hover:bg-black rounded-xl transition-all shadow-lg active:scale-95"
          >
            ĐÓNG CỬA SỔ
          </button>
        </div>
      </div>
    </div>
  );
}