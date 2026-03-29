import {
    LayoutDashboard,
    Users,
    Settings2,
    Store,
    Layers,
    Package,
    Tag,
    FileText,
    Truck,
    Boxes
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function SideBar() {
    const location = useLocation();

    return (
        <aside className="w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="px-4 py-6">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    TechStore Admin
                </h1>
            </div>

            <nav className="mt-4 px-3 space-y-1">

                {/* ===== DASHBOARD ===== */}
                <SidebarItem
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    active={location.pathname === "/dashboard"}
                />

                {/* ===== USER MANAGEMENT ===== */}
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User Management
                </div>

                <SidebarItem
                    to="/accounts"
                    icon={Users}
                    label="Accounts"
                    active={location.pathname.startsWith("/accounts")}
                />

                {/* ===== INVENTORY MANAGEMENT ===== */}
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Inventory
                </div>

                <SidebarItem
                    to="/categories"
                    icon={Layers}
                    label="Categories"
                    active={location.pathname.startsWith("/categories")}
                />

                <SidebarItem
                    to="/brands"
                    icon={Tag}
                    label="Brands"
                    active={location.pathname.startsWith("/brands")}
                />

                <SidebarItem
                    to="/suppliers"
                    icon={Truck}
                    label="Suppliers"
                    active={location.pathname.startsWith("/suppliers")}
                />

                <SidebarItem
                    to="/products"
                    icon={Package}
                    label="Products"
                    active={location.pathname.startsWith("/products")}
                />

                <SidebarItem
                    to="/inventories"
                    icon={Boxes}
                    label="Inventories"
                    active={location.pathname.startsWith("/inventories")}
                />

                {/* ===== ORGANIZATION ===== */}
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Organization
                </div>

                <SidebarItem
                    to="/branches"
                    icon={Store}
                    label="Branches"
                    active={location.pathname.startsWith("/branches")}
                />

                {/* ===== SYSTEM ===== */}
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Activity Logs
                </div>

                <SidebarItem
                    to="/activity"
                    icon={FileText}
                    label="Activity Logs"
                    active={location.pathname.startsWith("/activity")}
                />

                {/* ===== SETTINGS ===== */}
                <SidebarItem
                    to="/settings"
                    icon={Settings2}
                    label="Settings"
                    active={location.pathname.startsWith("/settings")}
                />

            </nav>
        </aside>
    );
}

function SidebarItem({ icon: Icon, label, active, to }) {
    return (
        <Link
            to={to}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 no-underline
                ${active
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }
            `}
        >
            <Icon
                className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-[2px]"}`}
            />
            <span>{label}</span>
        </Link>
    );
}

export default SideBar;