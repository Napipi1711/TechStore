import React, { useEffect, useState } from "react";
import { message, Tooltip, Empty, Spin } from "antd";
import {
    EyeOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    HistoryOutlined,
    EnvironmentOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import activityApi from "../../api/activityApi";

const StaffLogs = () => {
    const { staffId } = useParams();
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const fetchLogs = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const res = await activityApi.getWithFilter({
                actorId: staffId,
                page,
                limit
            });

            const logsData = res.data?.data || res.data?.logs || res.data?.data?.logs || [];
            const totalCount = res.data?.total || res.data?.data?.total || 0;

            setLogs(Array.isArray(logsData) ? logsData : []);
            setPagination({
                current: page,
                pageSize: limit,
                total: totalCount
            });

        } catch (error) {
            message.error("Không thể tải nhật ký hoạt động");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [staffId]);

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    // Hàm render màu sắc cho Action Tag
    const getActionStyle = (action) => {
        const act = action.toLowerCase();
        if (act.includes('create') || act.includes('thêm')) return 'bg-green-100 text-green-700 border-green-200';
        if (act.includes('update') || act.includes('sửa')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (act.includes('delete') || act.includes('xóa')) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-white rounded-full shadow-sm transition-all text-gray-400 hover:text-blue-600 border border-transparent hover:border-gray-100"
                        >
                            <ArrowLeftOutlined />
                        </button>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                                <HistoryOutlined className="text-blue-600" />
                                Nhật ký hoạt động
                            </h2>
                            <p className="text-slate-500 text-sm">Theo dõi lịch sử thao tác của nhân viên trên hệ thống</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        <span className="px-4 py-2 text-sm font-semibold text-blue-600">ID Nhân viên: {staffId}</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <Spin size="large" />
                            <p className="mt-4 text-slate-400 animate-pulse">Đang truy xuất dữ liệu...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="bg-white rounded-3xl p-20 shadow-sm border border-gray-100">
                            <Empty description="Chưa có dữ liệu hoạt động nào được ghi nhận" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((record, index) => (
                                <div
                                    key={record._id}
                                    className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getActionStyle(record.action)}`}>
                                            <ClockCircleOutlined />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className={`px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getActionStyle(record.action)}`}>
                                                    {record.action}
                                                </span>
                                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                                    <CalendarOutlined />
                                                    {new Date(record.createdAt).toLocaleString("vi-VN")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-600 font-medium">
                                                <span className="flex items-center gap-1 text-sm">
                                                    <EnvironmentOutlined className="text-gray-400" />
                                                    {record.branchId?.name || "Không xác định chi nhánh"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end border-t md:border-t-0 pt-3 md:pt-0">
                                        <button
                                            onClick={() => navigate(`/activity/staff/${record._id}/details`)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white rounded-xl transition-all font-semibold text-sm group-hover:shadow-lg group-hover:shadow-blue-200"
                                        >
                                            <EyeOutlined />
                                            Chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Timeline Line (Trang trí) */}
                    {!loading && logs.length > 0 && (
                        <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-100 -z-10 hidden md:block" />
                    )}
                </div>

                {/* Pagination Section */}
                {!loading && logs.length > 0 && (
                    <div className="mt-10 flex flex-col md:flex-row items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 gap-4">
                        <div className="text-sm text-slate-500">
                            Hiển thị từ <span className="font-bold text-slate-800">{(pagination.current - 1) * pagination.pageSize + 1}</span> đến <span className="font-bold text-slate-800">{Math.min(pagination.current * pagination.pageSize, pagination.total)}</span> của <span className="font-bold text-slate-800">{pagination.total}</span> logs
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchLogs(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${pagination.current === 1
                                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                        : "bg-white text-slate-600 border-gray-200 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                                    }`}
                            >
                                Trước
                            </button>

                            <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100">
                                {pagination.current} / {totalPages || 1}
                            </div>

                            <button
                                onClick={() => fetchLogs(pagination.current + 1)}
                                disabled={pagination.current === totalPages || totalPages === 0}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${pagination.current === totalPages || totalPages === 0
                                        ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                                        : "bg-white text-slate-600 border-gray-200 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                                    }`}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffLogs;