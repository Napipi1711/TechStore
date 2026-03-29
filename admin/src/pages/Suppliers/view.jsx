import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import supplierApi from "../../api/supplierApi";

export default function ViewSupplier() {
    const { id } = useParams();
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSupplier = async () => {
        try {
            setLoading(true);
            const res = await supplierApi.getById(id);
            setSupplier(res.data);
        } catch (error) {
            console.error("Fetch supplier detail error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplier();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600"></div>
                <span className="ml-3 text-slate-500 font-medium">Loading details...</span>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="p-6 text-center">
                <p className="text-slate-500">Supplier not found.</p>
                <Link to="/suppliers" className="text-indigo-600 hover:underline">Return to list</Link>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            {/* Breadcrumb & Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <nav className="mb-2 flex text-sm text-slate-500">
                        <Link to="/suppliers" className="hover:text-indigo-600 transition-colors">Suppliers</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-800 font-medium">Detail</span>
                    </nav>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        {supplier.name}
                    </h1>
                </div>

                <div className="flex gap-3">
                    {/* <Link
                        to={`/suppliers/update/${id}`}
                        className="rounded-lg bg-white border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
                    >
                        Edit Profile
                    </Link> */}
                    <Link
                        to="/suppliers"
                        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
                    >
                        ← Back to List
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
                            {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{supplier.name}</h2>
                        <p className="text-sm text-slate-500 mb-4">Official Partner</p>

                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${supplier.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                            }`}>
                            {supplier.isActive ? "● Active" : "○ Inactive"}
                        </span>
                    </div>
                </div>

                {/* Right Column: Detailed Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-6 py-4">
                            <h3 className="font-bold text-slate-800">Contact Information</h3>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        Phone Number
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">{supplier.phone}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        Email Address
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">{supplier.email}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                        Physical Address
                                    </dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                                        {supplier.address}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">System Records</p>
                                <p className="mt-1 text-sm text-slate-600">
                                    Partner since: <span className="font-bold text-slate-900">
                                        {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-GB') : "N/A"}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right text-xs text-slate-400 italic">
                                Last updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}