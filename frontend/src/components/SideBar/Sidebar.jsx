import {
    X,
    BadgeDollarSign,
    LayoutDashboard,
    Settings,
    ShoppingCart,
    Boxes,
    Users,
    History,
    UserCircle,
    LogOut,
    ChevronRight,
    Sparkles
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.branchRole; // branch_manager | staff

    const menuItems = [
        {
            // Đưa Doanh Thu lên đầu và dùng icon Dashboard
            icon: <LayoutDashboard size={20} />,
            label: "Doanh Thu",
            path: "/revenue",
            roles: ["branch_manager"]
        },
        {
            icon: <BadgeDollarSign size={20} />,
            label: "Point of sales",
            path: "/pos",
            roles: ["branch_manager", "staff"]
        },
        {
            icon: <ShoppingCart size={20} />,
            label: "Đơn Nhập Hàng",
            path: "/purchases",
            roles: ["branch_manager"]
        },
        {
            icon: <Boxes size={20} />,
            label: "Kho Hàng",
            path: "/inventories",
            roles: ["branch_manager"]
        },
        {
            icon: <History size={20} />,
            label: "Lịch Sử Bán",
            path: "/pos/history",
            roles: ["staff"]
        },
        {
            icon: <UserCircle size={20} />,
            label: "Khách Hàng",
            path: "/customer",
            roles: ["staff"]
        },
        {
            icon: <Users size={20} />,
            label: "Nhật Ký Hoạt Động",
            path: "/activity",
            roles: ["branch_manager"]
        },
        {
            icon: <Users size={20} />,
            label: "Nhân Viên",
            path: "/staff",
            roles: ["branch_manager"]
        },
    ];

    const filteredMenu = menuItems.filter(item => item.roles.includes(role));

    return (
        <>
            {/* Overlay cho Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
                fixed lg:static top-0 left-0 h-screen z-[70]
                w-72 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
            >
                {/* Header: Logo & Slogan động lực */}
                <div className="p-7 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group transition-transform hover:rotate-6">
                            <Boxes className="text-white" size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-lg leading-none tracking-tight">
                                POS<span className="text-blue-600">PRO</span>
                            </span>
                            <span className="text-[10px] font-bold text-blue-400/80 uppercase tracking-tight mt-1.5 flex items-center gap-1">
                                Hãy cố gắng hết mình 🙃
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-slate-50 text-slate-400 lg:hidden rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 px-4">
                        Danh Mục Hệ Thống
                    </p>

                    <nav className="space-y-1.5">
                        {filteredMenu.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    to={item.path}
                                    key={index}
                                    onClick={() => setIsOpen(false)}
                                    className="block group"
                                >
                                    <div
                                        className={`
                                        flex items-center justify-between px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-200
                                        ${isActive
                                                ? "bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1"
                                                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/50"
                                            }
                                    `}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <span className={`${isActive ? "text-white" : "text-blue-500 group-hover:scale-110 transition-transform duration-200"}`}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </div>
                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Section: User & Settings */}
                <div className="p-4 mt-auto border-t border-slate-50 bg-slate-50/30">
                    <Link
                        to="/settings"
                        onClick={() => setIsOpen(false)}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all mb-4
                            ${location.pathname === "/settings"
                                ? "bg-slate-800 text-white shadow-lg"
                                : "text-slate-500 hover:bg-white hover:shadow-sm"
                            }
                        `}
                    >
                        <Settings size={20} className={location.pathname === "/settings" ? "text-white" : "text-slate-400"} />
                        <span>Cấu hình</span>
                    </Link>

                    {/* User Card */}
                    <div className="p-3 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-black border border-blue-100">
                                {user?.name?.charAt(0).toUpperCase() || "A"}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate leading-tight">
                                {user?.name || "Admin"}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">
                                {role === "branch_manager" ? "Quản lý" : "Nhân viên"}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}