import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import supplierApi from "../../api/supplierApi";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchName, setSearchName] = useState(searchParams.get("name") || "");

    const fetchData = async (name = "") => {
        try {
            setLoading(true);
            const res = await supplierApi.getAll(name ? { name } : {});
            setSuppliers(res.data || []);
        } catch (error) {
            console.error("Fetch suppliers error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchName.trim()) {
            setSearchParams({ name: searchName });
        } else {
            setSearchParams({});
        }
        fetchData(searchName);
    };

    // Hàm đặt lại (Reset)
    const handleReset = () => {
        setSearchName("");
        setSearchParams({});
        fetchData("");
    };

    useEffect(() => {
        const name = searchParams.get("name") || "";
        setSearchName(name);
        fetchData(name);
    }, [searchParams]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this supplier?")) return;
        try {
            await supplierApi.remove(id);
            setSuppliers((prev) => prev.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Suppliers
                    </h1>
                    <p className="text-slate-500 mt-1">Manage your supply chain partners efficiently.</p>
                </div>

                <Link
                    to="/suppliers/create"
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                >
                    <span className="mr-2">+</span> Add Supplier
                </Link>
            </div>

            {/* Filters Section */}
            <div className="mb-6 flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative flex-1 min-w-[280px]">
                    <input
                        type="text"
                        placeholder="Search by supplier name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 pl-4 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                    Search
                </button>

                <button
                    onClick={handleReset}
                    className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Table Section */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">#</th>
                                <th className="px-6 py-4 font-semibold">Supplier Info</th>
                                <th className="px-6 py-4 font-semibold">Contact</th>
                                <th className="px-6 py-4 font-semibold">Address</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-6 bg-slate-50/50"></td>
                                    </tr>
                                ))
                            ) : suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <p className="text-lg font-medium text-slate-400">No suppliers found</p>
                                            <button onClick={handleReset} className="mt-2 text-indigo-600 hover:underline">Clear all filters</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier, index) => (
                                    <tr key={supplier._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{supplier.name}</div>
                                            <div className="text-xs text-slate-400">{supplier.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-700">{supplier.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                                            {supplier.address}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ${supplier.isActive
                                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                                : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                                                }`}>
                                                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${supplier.isActive ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                                                {supplier.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <Link to={`/suppliers/view/${supplier._id}`} title="View">
                                                    <Eye className="w-5 h-5 text-slate-400 hover:text-indigo-600 transition-colors" />
                                                </Link>
                                                <Link to={`/suppliers/update/${supplier._id}`} title="Edit">
                                                    <Edit className="w-5 h-5 text-slate-400 hover:text-blue-600 transition-colors" />
                                                </Link>
                                                <button onClick={() => handleDelete(supplier._id)} title="Delete">
                                                    <Trash2 className="w-5 h-5 text-slate-400 hover:text-red-600 transition-colors" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}