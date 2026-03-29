import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiFileText,
  FiPlus,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiHash
} from "react-icons/fi";

import purchaseApi from "../../api/purchaseApi";
import supplierApi from "../../api/supplierApi";
import productApi from "../../api/productApi";
import { getMyBranchApi } from "../../api/branchApi";

export default function CreatePurchase() {
  const navigate = useNavigate();
  const fetched = useRef(false);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [user, setUser] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    branchId: "",
    managerId: "",
    note: "",
    items: [
      {
        productId: "",
        quantity: 1,
        costPrice: 0,
        note: "",
      }
    ]
  });

  // Logic: Lấy user + branch (Giữ nguyên)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setForm((prev) => ({
        ...prev,
        managerId: storedUser.id || "",
        branchId: storedUser.branchId || "",
      }));
    }

    const fetchBranch = async () => {
      try {
        const res = await getMyBranchApi();
        setBranchName(res.data.name);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBranch();
  }, []);

  // Logic: Lấy suppliers + products (Giữ nguyên)
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchData = async () => {
      try {
        const [supplierRes, productRes] = await Promise.all([
          supplierApi.getAll(),
          productApi.getAll(),
        ]);

        const supplierList = Array.isArray(supplierRes?.data?.data)
          ? supplierRes.data.data
          : supplierRes.data;

        const productList =
          productRes?.data?.data ||
          productRes?.data?.products ||
          (Array.isArray(productRes?.data) ? productRes.data : []);

        setSuppliers(supplierList || []);
        setProducts(productList || []);
      } catch (error) {
        toast.error("Lỗi tải dữ liệu hệ thống");
      }
    };
    fetchData();
  }, []);

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setForm((prev) => ({ ...prev, supplierId }));
    const supplier = suppliers.find((s) => s._id === supplierId);
    setSelectedSupplier(supplier);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === "quantity" || field === "costPrice" ? Number(value) : value;
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, costPrice: 0, note: "" }]
    }));
  };

  const removeItem = (index) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || form.items.length === 0 || form.items.some(i => !i.productId || i.quantity <= 0 || i.costPrice <= 0)) {
      return toast.error("Vui lòng điền đầy đủ thông tin các sản phẩm");
    }

    try {
      setLoading(true);
      await purchaseApi.create(form);
      toast.success("Tạo đơn hàng thành công!");
      setTimeout(() => navigate("/purchases"), 1200);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = form.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-[#1a1a1a] font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header Section */}
        <header className="mb-16">
          <Link to="/purchases" className="group inline-flex items-center gap-2 text-gray-400 hover:text-black mb-6 transition-all">
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs uppercase tracking-widest font-semibold">Quay lại danh sách</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-2">Nhập Hàng</h1>
              <p className="text-gray-400 uppercase text-[10px] tracking-[0.3em] font-bold">Quản lý kho vận & Chuỗi cung ứng</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-300 uppercase block mb-1">Ngày lập đơn</span>
              <span className="text-sm font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* LEFT: MAIN FORM AREA */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-16">

              {/* Supplier Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">01</span>
                  <h2 className="text-sm uppercase tracking-widest font-extrabold">Đối tác cung cấp</h2>
                </div>
                <div className="relative border-b border-gray-200 focus-within:border-black transition-colors py-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Chọn nhà cung cấp từ hệ thống</label>
                  <select
                    value={form.supplierId}
                    onChange={handleSupplierChange}
                    className="w-full bg-transparent text-lg font-medium outline-none appearance-none cursor-pointer py-1"
                    required
                  >
                    <option value="">-- Click để chọn --</option>
                    {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <FiTruck className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                </div>
              </section>

              {/* Items Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">02</span>
                    <h2 className="text-sm uppercase tracking-widest font-extrabold">Danh mục hàng hóa</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FiPlus /> Thêm dòng mới
                  </button>
                </div>

                <div className="space-y-1">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-2 py-3 text-[10px] font-bold uppercase text-gray-400 border-b">
                    <div className="col-span-4">Sản phẩm</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-3">Đơn giá nhập</div>
                    <div className="col-span-2">Ghi chú</div>
                    <div className="col-span-1"></div>
                  </div>

                  {form.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <div className="col-span-4">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full bg-transparent font-medium outline-none text-sm"
                        >
                          <option value="">Sản phẩm...</option>
                          {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full bg-transparent text-center font-semibold outline-none text-sm"
                        />
                      </div>
                      <div className="col-span-3 flex items-center gap-1">
                        <span className="text-gray-400 text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          value={item.costPrice}
                          onChange={(e) => handleItemChange(index, "costPrice", e.target.value)}
                          className="w-full bg-transparent font-semibold outline-none text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleItemChange(index, "note", e.target.value)}
                          placeholder="..."
                          className="w-full bg-transparent text-gray-500 text-xs outline-none"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all px-2"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Note Section */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">03</span>
                  <h2 className="text-sm uppercase tracking-widest font-extrabold">Ghi chú đơn hàng</h2>
                </div>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                  rows="2"
                  className="w-full bg-transparent border-b border-gray-200 focus:border-black outline-none py-2 text-sm transition-all resize-none"
                  placeholder="Nhập yêu cầu đặc biệt hoặc lưu ý cho đơn nhập hàng này..."
                />
              </section>

              {/* Action Buttons */}
              <div className="pt-10 flex items-center gap-10">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-5 bg-black text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-gray-800 transition-all disabled:bg-gray-200"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận & Lưu đơn"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/purchases")}
                  className="text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                >
                  Hủy bỏ thao tác
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: SIDEBAR SUMMARY */}
          <div className="lg:col-span-4 space-y-12">

            {/* Total Highlight */}
            <div className="sticky top-10 space-y-12">
              <div className="border-l-4 border-black pl-8 py-2">
                <p className="text-[10px] uppercase font-extrabold text-gray-400 tracking-[0.2em] mb-4">Giá trị ước tính</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter">
                    {totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Context Info */}
              <div className="space-y-6 bg-gray-50 p-8 rounded-sm">
                <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b pb-4">Thông tin xử lý</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-gray-400" size={14} />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400 leading-none mb-1">Nhân viên phụ trách</p>
                      <p className="text-sm font-semibold">{user?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-gray-400" size={14} />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-gray-400 leading-none mb-1">Chi nhánh nhập</p>
                      <p className="text-sm font-semibold">{branchName || "Hệ thống..."}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Detail View */}
              <div className="p-8 border border-gray-100 rounded-sm">
                <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-6">Chi tiết đối tác</h3>
                {selectedSupplier ? (
                  <div className="space-y-4">
                    <p className="text-lg font-bold leading-tight">{selectedSupplier.name}</p>
                    <div className="space-y-2 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-gray-400">Email liên lạc</span>
                        <span className="text-sm break-all font-medium text-blue-600">{selectedSupplier.email}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-gray-400">Số điện thoại</span>
                        <span className="text-sm font-medium">{selectedSupplier.phone}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-gray-400">Địa chỉ trụ sở</span>
                        <span className="text-sm font-medium text-gray-600">{selectedSupplier.address}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-lg">
                    <p className="text-[11px] text-gray-400 italic">Chọn NCC để hiển thị dữ liệu</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}