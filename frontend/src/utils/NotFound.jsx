import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, QuestionCircleOutlined } from "@ant-design/icons";

const NotFound = () => {
    const navigate = useNavigate();
    const [count, setCount] = useState(5);

    useEffect(() => {
        if (count === 0) {
            navigate(-1);
            return;
        }

        const timer = setTimeout(() => {
            setCount((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [count, navigate]);

    return (
        <div className="relative flex flex-col items-center justify-center h-screen bg-slate-50 overflow-hidden">

            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="relative z-10 flex flex-col items-center text-center px-4">

                <div className="mb-6 relative">
                    <QuestionCircleOutlined className="text-8xl text-indigo-500 opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping" />
                    <h1 className="text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-400 leading-none select-none">
                        404
                    </h1>
                </div>

                <div className="space-y-4 max-w-md">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                        Ối! Bạn đi lạc rồi...
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Trang bạn đang tìm kiếm không tồn tại nhé.
                    </p>
                </div>

                <div className="mt-10 w-64 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
                        style={{ width: `${(count / 5) * 100}%` }}
                    ></div>
                </div>

                <p className="mt-4 text-slate-400 text-sm font-medium uppercase tracking-widest">
                    Tự động quay lại sau <span className="text-indigo-600 font-bold text-base">{count}</span> giây
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95"
                    >
                        <ArrowLeftOutlined className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Quay lại ngay
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-300 active:scale-95 font-medium"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>

            <div className="absolute bottom-8 text-slate-400 text-xs tracking-widest uppercase">
                Lost in the pixels
            </div>
        </div>
    );
};

export default NotFound;