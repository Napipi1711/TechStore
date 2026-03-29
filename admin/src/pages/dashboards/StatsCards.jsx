import { ShoppingCart, DollarSign, Package, ClipboardList } from "lucide-react";

export default function StatsCards({ data }) {
    const totals = data.reduce((acc, curr) => ({
        revenue: acc.revenue + curr.totalRevenue,
        profit: acc.profit + curr.totalProfit,
        orders: acc.orders + curr.totalOrders,
        quantity: acc.quantity + (curr.totalQuantity || 0) 
    }), { revenue: 0, profit: 0, orders: 0, quantity: 0 });

    const cards = [
        { title: "Tổng Doanh Thu", value: `$${totals.revenue.toLocaleString()}`, icon: DollarSign },
        { title: "Lợi Nhuận", value: `$${totals.profit.toLocaleString()}`, icon: ShoppingCart },
        { title: "Đơn Hàng", value: totals.orders, icon: ClipboardList },
        { title: "Chi Nhánh", value: data.length, icon: Package },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="border border-slate-200 p-6 bg-white flex flex-col gap-2">
                    <div className="w-10 h-10 border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-900">
                        <card.icon size={20} />
                    </div>
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{card.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                </div>
            ))}
        </div>
    );
}