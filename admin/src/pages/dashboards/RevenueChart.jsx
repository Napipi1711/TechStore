import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function RevenueChart({ data }) {
    // 1. Gộp dữ liệu theo branchName
    const aggregatedData = Object.values(
        data.reduce((acc, curr) => {
            if (!acc[curr.branchName]) {
                acc[curr.branchName] = { ...curr };
            } else {
                acc[curr.branchName].totalRevenue += curr.totalRevenue;
                acc[curr.branchName].totalOrders += curr.totalOrders;
                acc[curr.branchName].totalQuantity += curr.totalQuantity;
                acc[curr.branchName].totalCost += curr.totalCost;
                acc[curr.branchName].totalProfit += curr.totalProfit;
            }
            return acc;
        }, {})
    );

    // 2. Sắp xếp theo doanh thu giảm dần (Top Performance)
    const sortedData = aggregatedData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return (
        <div className="border border-slate-200 p-6 bg-white h-[450px] flex flex-col">
            <div className="mb-8">
                <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tighter">
                    Doanh Thu
                </h4>
                <p className="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase">
                    Theo tổng
                </p>
            </div>

            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="branchName"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                                borderRadius: '0px',
                                border: '1px solid #0f172a',
                                boxShadow: 'none',
                                fontSize: '12px',
                                fontFamily: 'monospace'
                            }}
                            formatter={(value) => [`$${value.toLocaleString()}`, 'REVENUE']}
                        />
                        <Bar dataKey="totalRevenue" barSize={45}>
                            {sortedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index === 0 ? '#0f172a' : index === 1 ? '#475569' : '#94a3b8'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#0f172a]"></div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Top 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#94a3b8]"></div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-tight">Others</span>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-1 uppercase">
                    Tổng cộng được sắp xếp theo doanh thu
                </div>
            </div>
        </div>
    );
}