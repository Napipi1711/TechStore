import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supplierApi from "../../api/supplierApi";

export default function UpdateSupplier() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSupplier = async () => {
        try {
            setLoading(true);
            const res = await supplierApi.getById(id);
            setFormData({
                name: res.data.name || "",
                phone: res.data.phone || "",
                email: res.data.email || "",
                address: res.data.address || "",
                isActive: res.data.isActive ?? true,
            });
        } catch (error) {
            console.error("Fetch supplier detail error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplier();
    }, [id]);

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
            setSaving(true);
            await supplierApi.update(id, formData);
            // Có thể thay alert bằng một thư viện toast như react-hot-toast để đẹp hơn
            alert("Update supplier successfully");
            navigate("/suppliers");
        } catch (error) {
            console.error("Update supplier error:", error);
            alert(error?.response?.data?.message || "Failed to update supplier");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Edit Supplier
                        </h1>
                        <p className="text-slate-500 mt-1">Modify supplier information and status.</p>
                    </div>
                    <Link
                        to="/suppliers"
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        ← Back to List
                    </Link>
                </div>

                {/* Form Card */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">

                            {/* Name Input */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Supplier Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Apple Inc"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="+84 ..."
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="contact@supplier.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            {/* Address Input */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Physical Address
                                </label>
                                <textarea
                                    name="address"
                                    rows="3"
                                    placeholder="Enter full address..."
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                            </div>

                            {/* Toggle Active Status */}
                            <div className="md:col-span-2 flex items-center p-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div className="ml-3">
                                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
                                        Active Supplier
                                    </label>
                                    <p className="text-xs text-slate-500">Enable or disable this partner from the active list.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-slate-50 border-t border-slate-200 px-8 py-6 flex items-center justify-end gap-3">
                            <Link
                                to="/suppliers"
                                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-10 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {saving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Changes...
                                    </>
                                ) : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}