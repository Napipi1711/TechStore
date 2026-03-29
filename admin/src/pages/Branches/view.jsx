import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft, MapPin, Phone, Building2,
    Hash, ShieldCheck, Mail, User, Users, Store, Edit
} from "lucide-react";
import { Avatar, Tag } from "antd";
import branchApi from "../../api/branchApi";
import userBranchApi from "../../api/userApi";

export default function ViewBranch() {
    const { id } = useParams();
    const [branch, setBranch] = useState(null);
    const [personnel, setPersonnel] = useState([]);

    const fetchData = async () => {
        try {
            const [branchRes, personnelRes] = await Promise.all([
                branchApi.getById(id),
                userBranchApi.getPersonnel(id)
            ]);
            setBranch(branchRes.data);
            setPersonnel(personnelRes.data);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    if (!branch) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Đang tải chi tiết chi nhánh...</p>
        </div>
    );

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">

                {/* HEADER NAVIGATION */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to="/branches"
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-2 text-sm font-medium"
                        >
                            <ArrowLeft size={16} /> Quay lại danh sách
                        </Link>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            Chi tiết chi nhánh
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to={`/branches/update/${id}`}
                            className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                        >
                            <Edit size={18} /> Chỉnh sửa
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* CỘT TRÁI: THÔNG TIN TỔNG QUAN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <Building2 size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-blue-500 bg-blue-50 px-2.5 py-1 rounded italic">
                                            #{branch.code}
                                        </span>
                                        <h2 className="text-4xl font-black text-slate-900 leading-tight">
                                            {branch.name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                {branch.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 pt-10 border-t border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Địa chỉ đăng ký</span>
                                        <p className="text-slate-600 font-medium leading-relaxed">{branch.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <span className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider mb-1">Hotline </span>
                                        <p className="text-slate-600 font-medium text-lg">{branch.phone || "---"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personnel Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <Users className="text-slate-900" size={20} />
                                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Đội ngũ nhân sự</h3>
                                    <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {personnel.length}
                                    </span>
                                </div>
                                <Link
                                    to={`/branches/${id}/personnel`}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-bold flex items-center gap-1"
                                >
                                    + Quản lý nhân sự
                                </Link>
                            </div>

                            {personnel.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {personnel.map((item) => (
                                        <div key={item._id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                                            <Avatar size={50} src={item.userId?.avatar} icon={<User />} className="bg-slate-100 shrink-0" />
                                            <div>
                                                <p className="text-[13px] font-bold text-slate-800 uppercase leading-none mb-1">{item.userId?.name}</p>
                                                <Tag color={item.role === 'branch_manager' ? 'gold' : 'blue'} className="text-[10px] font-bold uppercase m-0 border-none">
                                                    {item.role === 'branch_manager' ? 'Quản lý' : 'Nhân viên'}
                                                </Tag>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 text-sm italic">Chưa có dữ liệu nhân sự trực thuộc.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI: NGƯỜI QUẢN LÝ */}
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm sticky top-8">
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-[11px] uppercase tracking-widest mb-8">
                                <ShieldCheck size={18} className="text-blue-600" />
                                <span>Quản lý phụ trách</span>
                            </div>

                            {branch.manager ? (
                                <div className="flex flex-col items-center text-center">
                                    <Avatar
                                        size={100}
                                        src={branch.manager.avatar}
                                        icon={<User />}
                                        className="bg-slate-900 border-4 border-white shadow-xl mb-6"
                                    />
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                        {branch.manager.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-slate-500 mb-8">
                                        <Mail size={14} />
                                        <span className="text-sm font-medium">{branch.manager.email}</span>
                                    </div>

                                    <div className="w-full pt-6 border-t border-slate-100">
                                        <p className="text-[11px] text-slate-400 leading-relaxed font-semibold uppercase tracking-wider">
                                            Chịu trách nhiệm pháp lý và điều hành trực tiếp mọi hoạt động tại chi nhánh này.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center space-y-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <User size={32} className="mx-auto text-slate-300" />
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Chưa gán quản lý</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}