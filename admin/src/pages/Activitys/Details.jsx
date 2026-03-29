import React, { useEffect, useState } from "react";
import { message, Tag, Divider, Skeleton, Empty, Button, Tooltip } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeftOutlined,
    UserOutlined,
    FileTextOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    IdcardOutlined,
    MailOutlined,
    PhoneOutlined,
    DeploymentUnitOutlined
} from "@ant-design/icons";
import activityApi from "../../api/activityApi";

const Details = () => {
    const { staffId } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDetails = async () => {
        try {
            const res = await activityApi.getDetails(staffId);
            setLog(res.data);
        } catch (error) {
            message.error("Không thể tải chi tiết hoạt động");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [staffId]);

    // Hàm render Badge cho Action
    const renderActionBadge = (action) => {
        const actionUpper = action?.toUpperCase() || "";
        if (actionUpper.includes("CREATE")) return <Tag color="green" className="px-3 py-1 rounded-full font-medium">TẠO MỚI</Tag>;
        if (actionUpper.includes("UPDATE")) return <Tag color="blue" className="px-3 py-1 rounded-full font-medium">CẬP NHẬT</Tag>;
        if (actionUpper.includes("DELETE")) return <Tag color="error" className="px-3 py-1 rounded-full font-medium">XÓA</Tag>;
        return <Tag color="default" className="px-3 py-1 rounded-full font-medium">{action}</Tag>;
    };

    if (loading) return (
        <div className="max-w-4xl mx-auto p-8">
            <Skeleton active avatar paragraph={{ rows: 10 }} />
        </div>
    );

    if (!log) return (
        <div className="h-screen flex items-center justify-center">
            <Empty description="Không tìm thấy dữ liệu log" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-6">
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-blue-600 font-medium"
                    >
                        Quay lại danh sách
                    </Button>
                    <div className="text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        Hệ thống ghi nhận: {new Date(log.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                </div>

                <div className="bg-white shadow-2xl shadow-blue-100/50 rounded-3xl overflow-hidden border border-white">
                    {/* Top Hero Section */}
                    <div className="bg-slate-900 px-8 py-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10">
                            <FileTextOutlined style={{ fontSize: '200px', color: '#fff' }} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                {renderActionBadge(log.action)}
                                <span className="text-slate-400 text-sm">|</span>
                                <span className="text-slate-300 font-mono text-sm tracking-widest uppercase">Log ID: {staffId}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                {log.action || "Chi tiết hoạt động"}
                            </h1>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Column: Actor & Branch */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Staff Info Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <UserOutlined />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Thông tin nhân viên thực hiện</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 ml-2">
                                    <InfoCard icon={<IdcardOutlined />} label="Họ và tên" value={log.actorId?.name} />
                                    <InfoCard icon={<MailOutlined />} label="Email" value={log.actorId?.email} highlight />
                                    <InfoCard icon={<PhoneOutlined />} label="Số điện thoại" value={log.actorId?.phone} />
                                    <InfoCard icon={<DeploymentUnitOutlined />} label="Vai trò" value="Nhân viên hệ thống" />
                                </div>
                            </section>

                            <Divider className="my-0" />

                            {/* Branch Info Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                        <HomeOutlined />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Chi nhánh liên quan</h3>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InfoCard label="Tên chi nhánh" value={log.branchId?.name} />
                                    <InfoCard label="Địa chỉ" value={log.branchId?.address} />
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Timeline & Metadata */}
                        <div className="lg:col-span-1 border-l border-gray-100 pl-0 lg:pl-10">
                            <div className="sticky top-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                        <ClockCircleOutlined />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Thời gian</h3>
                                </div>

                                <div className="relative pl-8 border-l-2 border-blue-100 py-2">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                                    <p className="text-sm font-semibold text-slate-800 mb-1">Thời điểm ghi nhận</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {new Date(log.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-slate-500">
                                        {new Date(log.createdAt).toLocaleDateString("vi-VN", {
                                            day: '2-digit', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <p className="text-xs text-blue-800 font-bold uppercase tracking-widest mb-2">Ghi chú hệ thống</p>
                                    <p className="text-sm text-blue-600/80 leading-relaxed italic">
                                        "Mọi hành động đều được lưu vết để phục vụ công tác đối soát và bảo mật dữ liệu khách hàng."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sub-component cho từng item thông tin
const InfoCard = ({ icon, label, value, highlight = false }) => (
    <div className="flex flex-col group">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            {icon} {label}
        </span>
        <span className={`text-base font-medium break-words ${highlight ? 'text-blue-600' : 'text-slate-700'}`}>
            {value || <span className="text-slate-300 italic font-normal">Chưa cập nhật</span>}
        </span>
    </div>
);

export default Details;