import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import inventoriesApi from "../../api/inventoriesApi";

export default function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // 1. State lưu từ khóa tìm kiếm
  const navigate = useNavigate();

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const res = await inventoriesApi.getAll();
      const inventoryList = Array.isArray(res?.data?.data) ? res.data.data : [];
      setInventories(inventoryList);
    } catch (error) {
      console.error("Inventory API error:", error);
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);

  // 2. Logic lọc danh sách dựa trên tên sản phẩm hoặc SKU
  const filteredInventories = inventories.filter((item) => {
    const productName = item.productId?.name?.toLowerCase() || "";
    const sku = item.productId?.sku?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return productName.includes(search) || sku.includes(search);
  });

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Inventories</h1>

        {/* 3. Thanh tìm kiếm */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search product name or SKU..."
            className="w-full pl-4 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-2xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-4">Product</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Quantity</th>
              <th className="p-4">Available</th>
              <th className="p-4">Updated</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventories.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center text-slate-500">
                  {searchTerm ? "No products match your search" : "No inventory found"}
                </td>
              </tr>
            ) : (
              filteredInventories.map((item) => {
                const lowStock = (item.quantity ?? 0) - (item.reservedQty ?? 0) <= 5;
                return (
                  <tr
                    key={item._id}
                    className={`border-t ${lowStock ? "bg-red-50" : ""} hover:bg-slate-50`}
                  >
                    <td className="p-4 font-medium">{item.productId?.name || "-"}</td>
                    <td className="p-4">{item.productId?.sku || "-"}</td>
                    <td className="p-4">{item.branchId?.name || "-"}</td>
                    <td className="p-4 font-semibold">{item.quantity ?? 0}</td>
                    <td className="p-4 font-semibold text-sky-600">
                      {item.availableQty ?? item.quantity ?? 0}
                    </td>
                    <td className="p-4 text-slate-500">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/inventories/${item.productId?._id}`)}
                        className="px-3 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}