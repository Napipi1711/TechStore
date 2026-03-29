import React, { useEffect, useState } from "react";
import {
    Table,
    Card,
    Input,
    Button,
    Space,
    Typography,
    Tag,
    Tooltip,
    Empty
} from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    ReloadOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined
} from "@ant-design/icons";
import {
    getCustomersApi,
    getCustomerByPhoneApi,
} from "../../api/customerApi";
import { toast } from "react-toastify";
import CreateCustomer from "./CreateCustomer";

const { Title, Text } = Typography;

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);

    const fetchCustomers = async (searchValue = "") => {
        setLoading(true);
        try {
            let res;
            if (searchValue.trim()) {
                res = await getCustomerByPhoneApi(searchValue.trim());
                setCustomers(res.data.customer ? [res.data.customer] : []);
            } else {
                res = await getCustomersApi();
                setCustomers(res.data.customers || []);
            }
        } catch (err) {
            console.error(err);
            setCustomers([]);
            toast.error("Không thể tải danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearch = () => {
        fetchCustomers(search);
    };

    const handleReset = () => {
        setSearch("");
        fetchCustomers("");
    };

    // Định nghĩa các cột cho Table của Ant Design
    const columns = [
        {
            title: "Họ và tên",
            dataIndex: "name",
            key: "name",
            render: (text) => (
                <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <Text strong>{text || "N/A"}</Text>
                </Space>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            render: (text) => (
                <Tag icon={<PhoneOutlined />} color="blue">
                    {text}
                </Tag>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text) => (
                <span>
                    <MailOutlined style={{ marginRight: 8, color: "#8c8c8c" }} />
                    {text || <Text type="secondary">Chưa cập nhật</Text>}
                </span>
            ),
        },
        {
            title: "Địa chỉ liên lạc",
            dataIndex: "address",
            key: "address",
            ellipsis: true, // Tự động rút gọn nếu địa chỉ quá dài
            render: (text) => (
                <Tooltip title={text}>
                    {text || <Text type="secondary">---</Text>}
                </Tooltip>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
            <Card bordered={false} style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>

                {/* Header: Title + Button */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <div>
                        <Title level={3} style={{ margin: 0 }}>Danh sách khách hàng</Title>
                        <Text type="secondary">Quản lý và tìm kiếm thông tin khách hàng trong hệ thống</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setShowCreate(true)}
                        size="large"
                        style={{ borderRadius: "6px" }}
                    >
                        Thêm khách hàng
                    </Button>
                </div>

                {/* Filter bar */}
                <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
                    <Input
                        placeholder="Tìm theo số điện thoại..."
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300, borderRadius: "6px" }}
                        allowClear
                    />
                    <Button type="primary" onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                        Làm mới
                    </Button>
                </div>

                {/* Main Table */}
                <Table
                    columns={columns}
                    dataSource={customers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10, showTotal: (total) => `Tổng cộng ${total} khách hàng` }}
                    locale={{
                        emptyText: <Empty description="Không tìm thấy khách hàng nào" />
                    }}
                    style={{ border: "1px solid #f0f0f0", borderRadius: "8px" }}
                />
            </Card>

            {/* Popup modal */}
            {showCreate && (
                <CreateCustomer
                    onClose={() => setShowCreate(false)}
                    onCreated={() => {
                        setShowCreate(false);
                        fetchCustomers();
                    }}
                />
            )}
        </div>
    );
}