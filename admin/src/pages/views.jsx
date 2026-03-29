import { useEffect, useState, useCallback } from "react";
import dashboardApi from "../api/dashboardApi";
import StatsCards from "./dashboards/StatsCards";
import RevenueChart from "./dashboards/RevenueChart";
import BranchProfit from "./dashboards/BranchProfit";
import TopSelling from "./dashboards/TopSelling";

export default function Dashboard() {
    const [data, setData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("week");

    const fetchData = useCallback(async (currentFilter) => {
        setLoading(true);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        try {
            // Gọi đồng thời để tránh chờ đợi lâu
            const [resDashboard, resTop] = await Promise.all([
                dashboardApi.getDashboard({ groupBy: currentFilter }),
                dashboardApi.getTopSelling({
                    period: "month",
                    month: currentMonth,
                    year: currentYear,
                    limit: 3 // Chỉ lấy 3 sản phẩm
                })
            ]);

            setData(resDashboard.data.data || []);
            setTopProducts(resTop.data.data || []);
        } catch (error) {
            console.error("Dashboard API Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filter);
    }, [fetchData, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    if (loading) return (
        <div className="p-8 font-mono text-[10px] text-slate-400 animate-pulse tracking-widest">
            INITIALIZING_SYSTEM_CORE...
        </div>
    );

    return (
        <div className="flex flex-col gap-6 p-4 bg-white min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center px-2">
                <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                    Dashboard
                </h1>
                {/* <div className="text-[10px] font-bold text-slate-500 border-2 border-slate-900 px-2 py-1 uppercase">
                    
                </div> */}
            </div>

            {/* Top Stats Cards */}
            <StatsCards data={data} />

            {/* Middle Section: Chart & Branch Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart
                        data={data}
                        currentFilter={filter}
                        onFilterChange={handleFilterChange}
                    />
                </div>
                <div className="lg:col-span-1">
                    <BranchProfit data={data} />
                </div>
            </div>

            {/* Bottom Section: Top 3 Selling Products */}
            <div className="w-full">
                <TopSelling products={topProducts} />
            </div>
        </div>
    );
}