import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Filter, Calendar, Tag, Eye, Edit3, CheckCircle, MoreHorizontal } from "lucide-react";
import purchaseApi from "../../api/purchaseApi";
import { toast } from "react-toastify";
import Returns from "./Returns";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");
  const [returningId, setReturningId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Tăng số lượng hàng vì màn hình rộng hơn

  const fetchPurchases = async (params = {}) => {
    try {
      setLoading(true);
      const res = await purchaseApi.getAll(params);
      const purchaseList = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setPurchases(purchaseList);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load purchases");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = {
      status: searchParams.get("status") || "",
      fromDate: searchParams.get("fromDate") || "",
      toDate: searchParams.get("toDate") || "",
    };
    fetchPurchases(params);
  }, [searchParams]);

  const handleFilter = () => {
    const params = {};
    if (status) params.status = status;
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    setSearchParams(params);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(purchases.length / itemsPerPage);

  const renderStatus = (status) => {
    const colors = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      confirmed: "bg-emerald-50 text-emerald-600 border-emerald-100",
      cancelled: "bg-rose-50 text-rose-600 border-rose-100",
      returned: "bg-blue-50 text-blue-600 border-blue-100",
      updated: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[status] || "bg-gray-50 text-gray-500 border-gray-100"}`}>
        {status}
      </span>
    );
  };

  const handleConfirm = async (id) => {
    if (!window.confirm("Xác nhận đơn nhập hàng này?")) return;
    try {
      await purchaseApi.confirm(id);
      toast.success("Purchase confirmed");
      fetchPurchases({ status, fromDate, toDate });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Confirm failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-400 bg-white">
        <div className="animate-spin mb-4 text-black"><MoreHorizontal size={40} /></div>
        <p className="text-sm font-medium uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50/50 min-h-screen w-full">
      {/* HEADER SECTION - FULL WIDTH */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Nhập Hàng</h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mt-1">Quản lý và theo dõi các đơn nhập kho</p>
        </div>
        <Link to="/purchases/create" className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2 active:scale-95">
          <Plus size={16} strokeWidth={3} /> Tạo đơn mới
        </Link>
      </div>

      {/* FILTER BAR - FULL WIDTH */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm items-end">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Tag size={12} /> Trạng thái
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none transition-all appearance-none bg-gray-50">
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="updated">Đã cập nhật</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="returned">Đã trả hàng</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={12} /> Từ ngày
          </label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none bg-gray-50" />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={12} /> Đến ngày
          </label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none bg-gray-50" />
        </div>
        <div>
          <button onClick={handleFilter} className="w-full px-6 py-2 bg-gray-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 h-[38px]">
            <Filter size={14} /> Lọc kết quả
          </button>
        </div>
      </div>

      {/* DATA TABLE - FULL WIDTH */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Nhà cung cấp / Chi nhánh</th>
                <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest">Sản phẩm</th>
                <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Số lượng</th>
                <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Tổng giá trị</th>
                <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-center">Trạng thái</th>
                <th className="p-4 font-bold text-gray-400 text-[10px] uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-gray-300 font-medium uppercase text-xs tracking-widest">Không có dữ liệu đơn hàng</td>
                </tr>
              ) : (
                currentItems.map((purchase) => {
                  const totalQty = purchase.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
                  const totalCost = purchase.items.reduce((sum, i) => sum + (i.quantity || 0) * (i.costPrice || 0), 0);

                  return (
                    <tr key={purchase._id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">{purchase?.supplierId?.name || "N/A"}</div>
                        <div className="text-[11px] text-gray-400 font-medium italic">{purchase?.branchId?.name || "Kho tổng"}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 max-w-[300px]">
                          {purchase.items.slice(0, 2).map((item) => (
                            <div key={item._id} className="text-[12px] text-gray-600 truncate">
                              • {item?.productId?.name} <span className="text-gray-400 font-mono text-[10px]">(x{item.quantity})</span>
                            </div>
                          ))}
                          {purchase.items.length > 2 && (
                            <span className="text-[10px] text-blue-500 font-black uppercase">+ {purchase.items.length - 2} sản phẩm khác</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-sm font-bold text-gray-700">{totalQty}</td>
                      <td className="p-4 text-right">
                        <span className="font-black text-gray-900 text-sm">${totalCost.toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-center">{renderStatus(purchase?.status)}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                          {purchase?.status === "pending" && (
                            <Link to={`/purchases/${purchase._id}/edit`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all" title="Chỉnh sửa">
                              <Edit3 size={16} />
                            </Link>
                          )}
                          {purchase?.status === "updated" && (
                            <button onClick={() => handleConfirm(purchase._id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Xác nhận nhập kho">
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <Link to={`/purchases/${purchase._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết">
                            <Eye size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION - FULL WIDTH STYLE */}
        {purchases.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, purchases.length)} / {purchases.length} đơn hàng
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${currentPage === 1 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'}`}
              >
                Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-white hover:text-black'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${currentPage === totalPages ? 'text-gray-200 cursor-not-allowed' : 'text-gray-600 hover:bg-white border border-transparent hover:border-gray-200'}`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {returningId && (
        <Returns
          purchaseId={returningId}
          onClose={() => setReturningId(null)}
          onSuccess={() => fetchPurchases({ status, fromDate, toDate })}
        />
      )}
    </div>
  );
}