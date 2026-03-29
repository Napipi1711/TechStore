import { Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {

    const [time, setTime] = useState(new Date());
    const [user, setUser] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Load user
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <nav className="h-12 bg-blue-700 border-b border-blue-800 flex items-center shadow-md">

            {/* Logo */}
            <div className="w-52 px-4 flex flex-col justify-center border-r border-blue-800">
                <span className="font-black text-white text-xl leading-none">
                    TechStore
                </span>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">
                    POS
                </span>
            </div>

            {/* Menu */}
            <div className="flex items-center gap-4 ml-6 text-white">

                <Link to="/dashboard">Dashboard</Link>

                {/* chỉ manager mới thấy */}
                {user?.role === "manager" && (
                    <Link to="/purchases">Purchase</Link>
                )}

            </div>

            {/* Time */}
            <div className="flex-1 flex justify-end items-center px-4 text-blue-100">
                <Clock size={16} className="mr-2" />
                <span className="text-sm font-mono">
                    {time.toLocaleTimeString("en-US", { hour12: false })}
                </span>
            </div>

        </nav>
    );
}