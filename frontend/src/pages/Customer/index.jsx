// CustomerList.jsx
import React, { useEffect, useState } from "react";
import {
    Table,
    Card,
    Input,
    Button,
    Modal,
    Form,
    Space,
    Typography,
    Tag,
    Tooltip
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import {
    getCustomersApi,
    getCustomerByPhoneApi,
    createCustomerApi
} from "../../api/customerApi";

const { Title, Text } = Typography;

export default function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

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

    const handleCreate = async (values) => {
        setCreating(true);
        try {
            await createCustomerApi(values);
            toast.success("Thêm khách hàng thành công");
            setShowCreate(false);
            form.resetFields();
            setSearch("");
            fetchCustomers();
        } catch (err) {
            console.error(err);
            toast.error("Số điện thoại có thể đã tồn tại");
        } finally {
            setCreating(false);
        }
    };

    const columns = [
        {
            title: "Khách hàng",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (text) => text || <Text type="secondary">Chưa cập nhật</Text>,
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    {text || <Text type="secondary">---</Text>}
                </Tooltip>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button
                    type="link"
                    onClick={() => navigate(`/customer/${record._id}/purchases`)}
                >
                    Xem đơn hàng
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px" }}>
            <Card bordered={false} className="shadow-sm">
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0 }}>Quản lý Khách hàng</Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setShowCreate(true)}
                        size="large"
                    >
                        Thêm khách hàng
                    </Button>
                </div>

                {/* Filter */}
                <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
                    <Input
                        placeholder="Tìm theo số điện thoại..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={() => fetchCustomers(search)}
                        style={{ maxWidth: 300 }}
                        allowClear
                    />
                    <Button onClick={() => fetchCustomers(search)} type="primary" ghost>
                        Tìm kiếm
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => { setSearch(""); fetchCustomers(""); }}
                    />
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={customers}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                />
            </Card>

            {/* Modal Create Customer */}
            <Modal
                title="Thêm khách hàng mới"
                open={showCreate}
                onCancel={() => setShowCreate(false)}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                    initialValues={{ name: "", phone: "", email: "", address: "" }}
                >
                    <Form.Item
                        label="Họ và tên"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại" },
                            { pattern: /^[0-9]+$/, message: "Số điện thoại không hợp lệ" }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ type: "email", message: "Email không đúng định dạng" }]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
                    </Form.Item>

                    <Form.Item label="Địa chỉ" name="address">
                        <Input prefix={<HomeOutlined />} placeholder="Số nhà, tên đường..." />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: "right", marginTop: 24 }}>
                        <Space>
                            <Button onClick={() => setShowCreate(false)}>Hủy bỏ</Button>
                            <Button type="primary" htmlType="submit" loading={creating}>
                                Tạo khách hàng
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}