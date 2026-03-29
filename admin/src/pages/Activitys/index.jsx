import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Avatar, message, Input, Space, Card, Statistic, Row, Col, Tooltip } from "antd";
import {
    EyeOutlined,
    SearchOutlined,
    UserOutlined,
    CheckCircleOutlined,
    StopOutlined,
    TeamOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";

const ActivityIndex = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await accountApi.getAll();
            const staffs = res.data.users.filter(u => u.role === "staff");
            setUsers(staffs);
        } catch (error) {
            message.error("Không thể tải danh sách staff");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    // Filter logic
    const filteredData = users.filter(user =>
        user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.userCode?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: "Nhân viên",
            key: "staff_info",
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={record.avatar}
                        icon={<UserOutlined />}
                        size={45}
                        className="border-2 border-blue-100 shadow-sm"
                    />
                    <div>
                        <div className="font-bold text-gray-900 leading-none mb-1">{record.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{record.userCode}</div>
                    </div>
                </div>
            )
        },
        {
            title: "Liên hệ",
            dataIndex: "email",
            key: "email",
            render: (email) => <span className="text-gray-500 italic">{email}</span>
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            key: "isActive",
            render: (active) => (
                <Tag
                    icon={active ? <CheckCircleOutlined /> : <StopOutlined />}
                    color={active ? "success" : "error"}
                    className="px-3 py-1 rounded-full font-medium"
                >
                    {active ? "Hoạt động" : "Tạm khóa"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết lịch sử hoạt động">
                    <Button
                        type="primary"
                        shape="round"
                        icon={<EyeOutlined />}
                        className="bg-indigo-600 hover:bg-indigo-700 border-none shadow-md flex items-center gap-2"
                        onClick={() => navigate(`/activity/staff/${record._id}`)}
                    >
                        Xem Logs
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            Giám sát hoạt động
                        </h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <TeamOutlined className="text-blue-500" />
                            Quản lý {users.length} nhân viên trong hệ thống
                        </p>
                    </div>

                    <Input
                        placeholder="Tìm theo tên hoặc mã NV..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="max-w-sm h-11 rounded-xl shadow-sm border-none"
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                {/* Quick Stats Card */}
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TeamOutlined style={{ fontSize: '60px' }} />
                            </div>
                            <Statistic
                                title={<span className="text-gray-400 font-medium uppercase text-xs tracking-wider">Tổng nhân viên</span>}
                                value={users.length}
                                valueStyle={{ color: '#1e293b', fontWeight: 800 }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <CheckCircleOutlined style={{ fontSize: '60px', color: '#52c41a' }} />
                            </div>
                            <Statistic
                                title={<span className="text-gray-400 font-medium uppercase text-xs tracking-wider">Đang hoạt động</span>}
                                value={users.filter(u => u.isActive).length}
                                valueStyle={{ color: '#059669', fontWeight: 800 }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Table Section */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 8,
                            className: "p-6",
                            showTotal: (total) => `Tổng cộng ${total} nhân viên`
                        }}
                        className="custom-table"
                        onRow={(record) => ({
                            className: "cursor-pointer hover:bg-slate-50/50 transition-all"
                        })}
                    />
                </div>

                {/* Footer Tip */}
                <div className="text-center text-slate-400 text-xs">
                    Hệ thống tự động cập nhật dữ liệu log mỗi khi có thay đổi từ phía nhân viên.
                </div>
            </div>

            <style jsx="true">{`
                .custom-table .ant-table-thead > tr > th {
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 12px;
                    letter-spacing: 0.05em;
                }
                .custom-table .ant-table-tbody > tr > td {
                    padding: 16px;
                }
            `}</style>
        </div>
    );
};

export default ActivityIndex;