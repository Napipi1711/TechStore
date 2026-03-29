import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  History,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ClipboardList,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import inventoriesApi from "../../api/inventoriesApi";

export default function Details() {
  const { productId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inventory, setInventory] = useState(null);
  const [movements, setMovements] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  const [sourceFilter, setSourceFilter] = useState(searchParams.get("source") || "");

  // --- LOGIC PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(movements.length / itemsPerPage);

  // Lấy dữ liệu của trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovements = movements.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  // ------------------------

  const fetchData = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await inventoriesApi.getDetails(productId, filters);
      if (res.data.success) {
        setInventory(res.data.data.inventory);
        setMovements(res.data.data.movements);
        setLogs(res.data.data.logs);
        setCurrentPage(1); // Reset về trang 1 khi filter/fetch mới
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết kho:", error);
      setInventory(null);
      setMovements([]);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialFilters = Object.fromEntries(searchParams.entries());
    fetchData(initialFilters);
  }, [productId, searchParams]);

  const applyFilter = () => {
    const filters = {};
    if (typeFilter) filters.type = typeFilter;
    if (sourceFilter) filters.source = sourceFilter;
    setSearchParams(filters);
  };

  const formatUSD = (value) => `$${Number(value).toFixed(2)}`;

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!inventory) return (
    <div className="p-6 text-center">
      <p className="text-red-500 font-medium text-lg">Không tìm thấy kho hàng</p>
      <button onClick={() => navigate(-1)} className="mt-4 text-blue-500 flex items-center gap-2 mx-auto">
        <ArrowLeft size={18} /> Quay lại
      </button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50 min-h-screen text-slate-800">

      {/* HEADER & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Quay lại Kho hàng
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/sales/product/${productId}`)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black"
          >
            Xem bán hàng
          </button>

          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Chi tiết sản phẩm
          </span>
        </div>
      </div>

      {/* PRODUCT + INVENTORY INFO CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex gap-6">
          <div className="bg-blue-50 p-4 rounded-lg h-fit">
            <Package size={40} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{inventory.productId.name}</h2>
            <p className="text-gray-500 mb-4">
              SKU: <span className="font-mono text-gray-700">{inventory.productId.sku}</span>
            </p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold">Chi nhánh</span>
                <span className="font-medium text-gray-700">{inventory.branchId.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold">Giá bán</span>
                <span className="font-bold text-green-600">{formatUSD(inventory.productId.price)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 uppercase font-semibold">Số lượng tồn</span>
                <span className={`font-bold ${inventory.quantity < 10 ? 'text-red-500' : 'text-blue-600'}`}>
                  {inventory.quantity} {inventory.productId.unit || "pcs"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-500 border-b pb-2">Tổng quan tài chính</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giá vốn trung bình</span>
            <span className="font-semibold">{formatUSD(inventory.avgCost)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Giá mua gần nhất</span>
            <span className="font-semibold">{formatUSD(inventory.lastPurchasePrice)}</span>
          </div>
          <div className="pt-2">
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 leading-relaxed italic">
              Địa chỉ: {inventory.branchId.address}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-gray-600 font-medium">
          <Filter size={18} />
          <span>Bộ lọc:</span>
        </div>
        <div className="flex flex-1 gap-4 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm min-w-[140px]"
          >
            <option value="">Tất cả loại</option>
            <option value="in">Nhập kho</option>
            <option value="out">Xuất kho</option>
            <option value="adjustment">Điều chỉnh</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm min-w-[140px]"
          >
            <option value="">Tất cả nguồn</option>
            <option value="purchase">Nhập hàng</option>
            <option value="sale">Bán hàng</option>
            <option value="return">Trả hàng</option>
            <option value="adjustment">Điều chỉnh</option>
          </select>

          <button
            onClick={applyFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
          >
            Áp dụng
          </button>
        </div>
      </div>

      {/* STOCK MOVEMENTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={20} className="text-blue-500" />
            <h3 className="text-lg font-bold">Chuyển động kho</h3>
          </div>
          <span className="text-xs text-gray-500 font-medium">Hiển thị {currentMovements.length}/{movements.length} bản ghi</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] tracking-wider font-bold">
                <th className="px-6 py-4">Loại</th>
                <th className="px-6 py-4">SL</th>
                <th className="px-6 py-4 text-center">Giá đơn vị</th>
                <th className="px-6 py-4 text-center">Thành tiền</th>
                <th className="px-6 py-4">Nguồn</th>
                <th className="px-6 py-4">Ghi chú</th>
                <th className="px-6 py-4">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentMovements.map((m) => (
                <tr key={m._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                      ${m.type === 'in' ? 'bg-green-100 text-green-700' :
                        m.type === 'out' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                      {m.type === 'in' ? <ArrowDownLeft size={12} /> : m.type === 'out' ? <ArrowUpRight size={12} /> : <RefreshCw size={12} />}
                      {m.type === 'in' ? 'Nhập' : m.type === 'out' ? 'Xuất' : 'Điều chỉnh'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {m.type === 'in' ? '+' : '-'}{m.quantity}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{formatUSD(m.unitCost)}</td>
                  <td className="px-6 py-4 text-center font-semibold text-gray-900">{formatUSD(m.totalCost)}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">
                    {m.source === 'purchase' ? 'Nhập hàng' :
                      m.source === 'sale' ? 'Bán hàng' :
                        m.source === 'return' ? 'Trả hàng' : 'Điều chỉnh'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">{m.note || "-"}</td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(m.createdAt).toLocaleDateString()} <br />
                    <span className="text-[10px]">{new Date(m.createdAt).toLocaleTimeString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => goToPage(index + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${currentPage === index + 1
                    ? "bg-blue-600 text-white shadow-md"
                    : "hover:bg-white text-gray-500"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* LOGS TABLE */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2 text-gray-700 font-bold">
          <ClipboardList size={20} className="text-gray-400" />
          <h3>Lịch sử hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold">
                <th className="px-6 py-3">Người thao tác</th>
                <th className="px-6 py-3">Hành động</th>
                <th className="px-6 py-3">Thay đổi</th>
                <th className="px-6 py-3">Ngày giờ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{log.actorId.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase">{log.actorId.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                    SL: <span className="text-gray-900">{log.details.quantity}</span>,
                    Giá: <span className="text-gray-900">{formatUSD(log.details.costPrice)}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}
    </div>
  );
}