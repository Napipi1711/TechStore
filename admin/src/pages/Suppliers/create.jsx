import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supplierApi from "../../api/supplierApi";

export default function CreateSupplier() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await supplierApi.create(formData);
      alert("Create supplier successfully");
      navigate("/suppliers");
    } catch (error) {
      console.error("Create supplier error:", error);
      alert(error?.response?.data?.message || "Failed to create supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Create Supplier</h1>
        <Link
          to="/suppliers"
          className="rounded-md border border-black px-4 py-2 text-black hover:bg-black hover:text-white"
        >
          Back
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-slate-300 px-4 py-2 outline-none focus:border-slate-800"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Active
            </label>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-md border border-black px-4 py-2 text-black hover:bg-black hover:text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>

            <Link
              to="/suppliers"
              className="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}