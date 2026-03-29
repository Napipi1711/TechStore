import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function BranchProfit({ data }) {
  // 1. Gộp dữ liệu theo branchName
  const aggregatedData = Object.values(
    data.reduce((acc, curr) => {
      if (!acc[curr.branchName]) {
        acc[curr.branchName] = { ...curr };
      } else {
        acc[curr.branchName].totalRevenue += curr.totalRevenue;
        acc[curr.branchName].totalProfit += curr.totalProfit;
        acc[curr.branchName].totalOrders += curr.totalOrders;
      }
      return acc;
    }, {})
  );

  // 2. Sắp xếp theo lợi nhuận giảm dần
  const sortedData = aggregatedData.sort((a, b) => b.totalProfit - a.totalProfit);

  return (
    <div className="border border-slate-200 p-6 bg-white h-full">
      <h4 className="text-lg font-bold text-slate-900 mb-6">Hiệu Suất Chi Nhánh</h4>

      <div className="space-y-4">
        {sortedData.map((item, index) => (
          <div key={index} className="group border border-slate-100 p-4 hover:border-slate-900 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.branchName}</p>
                <p className="text-[10px] text-slate-400 uppercase font-medium">
                  {item.totalOrders} Đơn hàng
                </p>
              </div>
              <div className="text-emerald-600">
                <ArrowUpRight size={16} />
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Lợi nhuận</p>
                <p className="text-md font-bold text-slate-900">
                  ${item.totalProfit.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Doanh thu</p>
                <p className="text-sm font-medium text-slate-600">
                  ${item.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="w-full h-[2px] bg-slate-100 mt-3">
              <div
                className="h-full bg-slate-900"
                style={{ width: `${Math.min((item.totalProfit / item.totalRevenue) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

    
    </div>
  );
}