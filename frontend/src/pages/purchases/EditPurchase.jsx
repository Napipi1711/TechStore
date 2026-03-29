import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowLeft, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";

import purchaseApi from "../../api/purchaseApi";
import productApi from "../../api/productApi";

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fetched = useRef(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    supplierName: "",
    note: "",
    items: [],
  });

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const fetchData = async () => {
      try {
        const [purchaseRes, productRes] = await Promise.all([
          purchaseApi.getById(id),
          productApi.getAll(),
        ]);

        const p = purchaseRes.data.data;
        const rawProducts = productRes?.data?.data || productRes?.data?.products || (Array.isArray(productRes?.data) ? productRes.data : []);

        const productList = rawProducts.map((prod) => ({
          _id: prod._id || prod.id,
          name: prod.name,
        }));

        setProducts(productList);

        const mappedItems = p.items.map((item) => ({
          productId: item.productId?._id || item.productId?.id || item.productId || "",
          quantity: item.quantity || 1,
          costPrice: item.costPrice || 0,
          note: item.note || "",
        }));

        setForm({
          supplierId: p.supplierId?._id || p.supplierId || "",
          supplierName: p.supplierId?.name || "",
          note: p.note || "",
          items: mappedItems,
        });
      } catch (err) {
        console.error(err);
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = field === "quantity" || field === "costPrice" ? Number(value) : value;
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: "", quantity: 1, costPrice: 0, note: "" }],
    }));
  };

  const removeItem = (index) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0 || form.items.some((i) => !i.productId || i.quantity <= 0 || i.costPrice <= 0)) {
      return toast.error("Please check product information");
    }

    try {
      setSaving(true);
      await purchaseApi.update(id, {
        supplierId: form.supplierId,
        note: form.note,
        items: form.items,
      });
      await purchaseApi.confirm(id);
      toast.success("Purchase confirmed!");
      navigate("/purchases");
    } catch (err) {
      console.error(err);
      toast.error("Process failed");
    } finally {
      setSaving(false);
    }
  };

  // Tính tổng và format không có số lẻ
  const totalPrice = form.items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0, // Bỏ .00
  }).format(totalPrice);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white text-sm tracking-widest text-gray-400 uppercase">
      Loading...
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black antialiased px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Navigation */}
        <Link to="/purchases" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-tighter hover:opacity-50 transition-opacity mb-10">
          <FiArrowLeft size={14} /> Back to list
        </Link>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b border-black">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Purchase Order</h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">ID: {id.toUpperCase()}</p>
          </div>
          <div className="text-left md:text-right">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Total Amount</span>
            <span className="text-4xl font-black">{formattedTotal}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Supplier Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest">Supplier</label>
              <input
                type="text"
                value={form.supplierName}
                disabled
                className="w-full border-b border-gray-200 py-2 bg-transparent font-medium focus:outline-none text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest">General Note</label>
              <input
                type="text"
                placeholder="Add a note..."
                value={form.note}
                onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                className="w-full border-b border-gray-200 py-2 bg-transparent focus:border-black transition-colors focus:outline-none"
              />
            </div>
          </section>

          {/* Items Table */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest">Order Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 text-[10px] font-black uppercase border border-black px-3 py-1 hover:bg-black hover:text-white transition-all rounded-full"
              >
                <FiPlus /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-left">
                    <th className="pb-4 font-black">Product Name</th>
                    <th className="pb-4 font-black w-24 px-4 text-center">Qty</th>
                    <th className="pb-4 font-black w-32 px-4">Price</th>
                    <th className="pb-4 font-black px-4">Item Note</th>
                    <th className="pb-4 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {form.items.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full bg-transparent font-bold appearance-none focus:outline-none focus:text-blue-600 transition-colors"
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-5 px-4">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full text-center bg-gray-50 rounded py-1 font-bold focus:outline-none focus:bg-black focus:text-white transition-all"
                        />
                      </td>
                      <td className="py-5 px-4 font-bold">
                        <div className="flex items-center gap-1">
                          <span>$</span>
                          <input
                            type="number"
                            value={item.costPrice}
                            onChange={(e) => handleItemChange(index, "costPrice", e.target.value)}
                            className="w-full bg-transparent focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <input
                          type="text"
                          placeholder="..."
                          value={item.note}
                          onChange={(e) => handleItemChange(index, "note", e.target.value)}
                          className="w-full bg-transparent text-sm italic text-gray-400 focus:outline-none focus:text-black"
                        />
                      </td>
                      <td className="py-5 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-gray-300 hover:text-black transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Submit Action */}
          <footer className="pt-10 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="group relative inline-flex items-center justify-center px-10 py-4 font-black text-white bg-black rounded-none overflow-hidden transition-all hover:pr-14 disabled:bg-gray-300"
            >
              <span className="relative uppercase tracking-widest text-xs">
                {saving ? "Processing..." : "Confirm & Complete Order"}
              </span>
              {!saving && <FiCheck className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all" />}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}