import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getStaffSaleHistoryApi } from "../../api/posApi";
import { Calendar, ChevronLeft, ChevronRight, Hash, FileText, AlertCircle, X } from 'lucide-react';
import BillPdf from "../../utils/BillPdf";

export default function ViewHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [date, setDate] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  // State điều khiển Modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ... (giữ nguyên các useEffect và hàm fetchHistory của bạn) ...
  useEffect(() => {
    const paramDate = searchParams.get("date") || "";
    setDate(paramDate);
  }, [searchParams]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getStaffSaleHistoryApi({ date });
      const data = (res.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(data);
      const revenue = data.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      setTotalRevenue(revenue);
    } catch (err) {
      console.error("Error fetching sale history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    setCurrentPage(1);
  }, [date]);

  const handleDateChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set("date", value);
    else newParams.delete("date");
    setSearchParams(newParams);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(history.length / itemsPerPage);

  // Hàm xử lý khi nhấn "Xuất PDF" ở dòng table
  const handleRequestExport = (item) => {
    setSelectedSale(item);
    setIsConfirming(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="p-6 bg-white min-h-screen font-sans">

      {/* HEADER & FILTER (Giữ nguyên giao diện của bạn) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
            <Hash className="w-6 h-6" /> Lịch sử giao dịch
          </h2>
          <p className="text-gray-400 text-sm font-medium">Quản lý dòng tiền và hiệu suất bán hàng</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl px-5">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Doanh thu</p>
            <p className="text-xl font-black text-gray-900">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-gray-100 p-3 rounded-xl px-5 text-right shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tổng đơn</p>
            <p className="text-xl font-black text-gray-900">{history.length}</p>
          </div>
        </div>
      </div>

      {/* FILTER DATE */}
      <div className="mb-6 flex items-center gap-3 bg-white border border-gray-100 p-2 rounded-2xl w-fit shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1 border-r border-gray-100">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase">Ngày</span>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => handleDateChange(e.target.value)}
          className="text-sm font-bold text-gray-800 outline-none pr-4 cursor-pointer"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase">Mã đơn</th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase">Khách hàng</th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase">Sản phẩm</th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase">Thành tiền</th>
              <th className="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase">Trạng thái</th>
              <th className="px-6 py-4 text-left text-[11px] font-black text-gray-400 uppercase">Nhân viên</th>
              <th className="px-6 py-4 text-right text-[11px] font-black text-gray-400 uppercase italic">Thời gian</th>
              <th className="px-6 py-4 text-center text-[11px] font-black text-gray-400 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((item) => (
              <tr key={item.saleId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-black text-gray-900">#{item.saleCode}</td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-700">{item.customerName}</p>
                  <p className="text-[10px] text-gray-400">{item.customerPhone}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 max-w-[180px]">
                    {item.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-gray-600 truncate">{p.productName}</span>
                        <span className="font-bold text-gray-800 ml-2">x{p.quantity}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-black text-blue-600">${item.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border ${item.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700 uppercase text-[11px]">{item.staffName}</td>
                <td className="px-6 py-4 text-right text-[11px] text-gray-400">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleRequestExport(item)}
                    className="p-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-transform active:scale-95 shadow-sm"
                    title="Xuất hóa đơn"
                  >
                    <FileText size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION (giữ nguyên của bạn) */}

      {/* MODAL XÁC NHẬN (CONFIRMATION OVERLAY) */}
      {/* MODAL XÁC NHẬN */}
      {isConfirming && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
          {/* Backdrop với hiệu ứng mờ dần (Fade) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => { setIsConfirming(false); setSelectedSale(null); }}
          ></div>

          {/* Modal Content với hiệu ứng phóng to (Scale Up) */}
          <div
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
            style={{
              animation: 'modalShow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
            }}
          >
            {/* Thêm thẻ style này ngay trong component để định nghĩa keyframes */}
            <style>{`
        @keyframes modalShow {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase">Xác nhận xuất</h3>
              <p className="text-gray-500 text-sm mt-2">
                Hệ thống sẽ khởi tạo PDF cho đơn <span className="font-bold text-gray-900">#{selectedSale?.saleCode}</span>
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => { setIsConfirming(false); setSelectedSale(null); }}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
              >
                HỦY
              </button>

              {/* Nút Xuất từ component BillPdf */}
              <div className="flex-1" onClick={() => setIsConfirming(false)}>
                <BillPdf sale={selectedSale} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}