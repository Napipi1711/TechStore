import React from 'react';
import { LogOut, Bell, User, Menu } from 'lucide-react';

const Navbar = () => {

  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("adminInfo");
      window.location.href = "/login";
    }
  };

  return (
    <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">


      <div className="flex items-center gap-4">

      </div>


      <div className="flex items-center gap-6">

        <button className="relative text-slate-500 hover:text-blue-600 transition">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3 border-l pl-6 border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {adminInfo.name || "Admin"}
            </p>
            <p className="text-xs text-slate-500 capitalize">{adminInfo.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
            {adminInfo.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
          </div>
        </div>


        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;