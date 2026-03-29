import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import revenueApi from "../../api/revenueApi";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Calendar, Filter, DollarSign, ShoppingCart, TrendingUp, Package, AlertCircle } from 'lucide-react';

export default function RevenueIndex() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy ngày hiện tại định dạng YYYY-MM-DD để chặn chọn ngày tương lai
    const today = new Date().toISOString().split('T')[0];

    const [from, setFrom] = useState(searchParams.get("from") || "");
    const [to, setTo] = useState(searchParams.get("to") || "");
    const [groupBy, setGroupBy] = useState(searchParams.get("groupBy") || "day");

    const fetchData = async () => {
        // Kiểm tra nếu người dùng cố tình nhập tay ngày tương lai vào state
        if (from > today || to > today) {
            alert("Không được chọn ngày ở tương lai!");
            return;
        }

        try {
            setLoading(true);
            const params = { from, to, groupBy };
            const res = await revenueApi.getDashboard(params);
            setData(res.data.data || []);
            setSearchParams(params);
        } catch (error) {
            console.error("❌ API ERROR:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [groupBy]);

    // Logic Fill Gap (Lấp đầy ngày trống)
    const getFilledChartData = () => {
        const apiData = Array.isArray(data) ? data : [];
        if (groupBy !== 'day' || !from || !to) return apiData;

        const startDate = new Date(from);
        const endDate = new Date(to);
        if (startDate > endDate) return apiData;

        const filledData = [];
        let curr = new Date(startDate);

        while (curr <= endDate) {
            const dateStr = curr.toISOString().split('T')[0];
            const found = apiData.find(item => item.date === dateStr);

            filledData.push(found || {
                date: dateStr,
                totalOrders: 0,
                totalRevenue: 0,
                totalProfit: 0,
                isFilled: true
            });
            curr.setDate(curr.getDate() + 1);
        }
        return filledData;
    };

    const chartData = getFilledChartData();
    const safeApiData = Array.isArray(data) ? data : [];

    const totals = safeApiData.reduce((acc, curr) => ({
        revenue: acc.revenue + (curr.totalRevenue || 0),
        profit: acc.profit + (curr.totalProfit || 0),
        orders: acc.orders + (curr.totalOrders || 0),
    }), { revenue: 0, profit: 0, orders: 0 });

    // Hàm helper định dạng tiền tệ $
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
                            <TrendingUp className="text-indigo-600" size={32} />
                            REVENUE INDEX
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-end gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                        {/* Chặn ngày tương lai bằng max={today} */}
                        <FilterBlock label="From" value={from} onChange={setFrom} type="date" max={today} />
                        <FilterBlock label="To" value={to} onChange={setTo} type="date" max={today} />

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Group By</label>
                            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
                                className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none h-[40px]">
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                        </div>

                        <button onClick={fetchData} disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl transition-all h-[40px] disabled:opacity-50">
                            {loading ? "..." : "FILTER"}
                        </button>
                    </div>
                </div>

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Revenue" value={totals.revenue} icon={<DollarSign />} color="text-indigo-600" bg="bg-indigo-50" format={formatCurrency} />
                    <StatCard title="Total Profit" value={totals.profit} icon={<TrendingUp />} color="text-emerald-600" bg="bg-emerald-50" format={formatCurrency} />
                    <StatCard title="Total Orders" value={totals.orders} icon={<ShoppingCart />} color="text-amber-600" bg="bg-amber-50" isMoney={false} />
                </div>

                {/* CHART */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => [formatCurrency(val), '']}
                                    labelFormatter={(label) => {
                                        const item = chartData.find(i => i.date === label);
                                        return item?.isFilled ? `${label} (No Data)` : label;
                                    }}
                                />
                                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                                <Bar dataKey="totalRevenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={25} />
                                <Bar dataKey="totalProfit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Time Period</th>
                                <th className="px-6 py-4 text-center">Orders</th>
                                <th className="px-6 py-4 text-right">Revenue</th>
                                <th className="px-6 py-4 text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {safeApiData.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{item.date}</td>
                                    <td className="px-6 py-4 text-center text-slate-500">{item.totalOrders}</td>
                                    <td className="px-6 py-4 text-right font-bold text-indigo-600">{formatCurrency(item.totalRevenue)}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatCurrency(item.totalProfit)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function FilterBlock({ label, value, onChange, type, max }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">{label}</label>
            <input type={type} value={value} max={max} onChange={(e) => onChange(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-[40px] bg-slate-50" />
        </div>
    );
}

function StatCard({ title, value, icon, color, bg, format, isMoney = true }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black mt-1 text-slate-800">
                    {isMoney ? format(value) : value.toLocaleString()}
                </p>
            </div>
            <div className={`p-4 rounded-2xl ${bg} ${color}`}>{icon}</div>
        </div>
    );
}