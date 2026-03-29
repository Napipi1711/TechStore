import React, { useState } from "react";
import {
    Form,
    Input,
    Select,
    DatePicker,
    Upload,
    Button,
    message,
    Card,
    Row,
    Col,
    Switch,
    Typography,
    Divider,
    Space
} from "antd";
import {
    UploadOutlined,
    ArrowLeftOutlined,
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const CreateAccount = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null); // Để preview ảnh
    const navigate = useNavigate();

    // Xử lý preview ảnh khi chọn file
    const handleUploadChange = (info) => {
        if (info.fileList.length > 0) {
            const file = info.fileList[0].originFileObj;
            const reader = new FileReader();
            reader.onload = (e) => setImageUrl(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setImageUrl(null);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        const formData = new FormData();

        Object.keys(values).forEach(key => {
            if (key === "avatar" && values[key]?.fileList?.[0]) {
                formData.append("avatar", values[key].fileList[0].originFileObj);
            }
            else if (key === "dob" && values[key]) {
                formData.append("dob", values[key].format("YYYY-MM-DD"));
            }
            else if (values[key] !== undefined) {
                formData.append(key, values[key]);
            }
        });

        try {
            await accountApi.create(formData);
            message.success("Tạo tài khoản thành công ✨");
            navigate("/admin/accounts");
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi tạo tài khoản");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>

                {/* Header Section */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(-1)}
                                style={{ padding: 0 }}
                            >
                                Quay lại danh sách
                            </Button>
                            <Title level={3} style={{ margin: 0 }}>Tạo tài khoản mới</Title>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button onClick={() => form.resetFields()}>Xóa Form</Button>
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => form.submit()}
                                size="large"
                            >
                                Tạo tài khoản
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Row gutter={24}>
                        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
                        <Col span={15}>
                            <Card bordered={false} title="Thông tin cá nhân" style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                                <Row gutter={16}>
                                    {/* Họ và tên chiếm toàn bộ hàng đầu tiên */}
                                    <Col span={24}>
                                        <Form.Item
                                            name="name"
                                            label="Họ và tên"
                                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                        >
                                            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" size="large" />
                                        </Form.Item>
                                    </Col>

                                    <Col span={12}>
                                        <Form.Item
                                            name="email"
                                            label="Địa chỉ Email"
                                            rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}
                                        >
                                            <Input prefix={<MailOutlined />} placeholder="email@company.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="phone"
                                            label="Số điện thoại"
                                            rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
                                        >
                                            <Input prefix={<PhoneOutlined />} placeholder="09xx xxx xxx" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="dob" label="Ngày sinh">
                                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="gender" label="Giới tính" initialValue="male">
                                            <Select options={[
                                                { value: "male", label: "Nam" },
                                                { value: "female", label: "Nữ" },
                                                { value: "other", label: "Khác" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name="address" label="Địa chỉ liên lạc">
                                            <Input.TextArea prefix={<HomeOutlined />} rows={2} placeholder="Số nhà, tên đường, quận/huyện..." />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        {/* CỘT PHẢI: TÀI KHOẢN & PHÂN QUYỀN */}
                        <Col span={9}>
                            <Space direction="vertical" style={{ width: '100%' }} size={24}>

                                {/* Card Avatar */}
                                <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
                                    <Form.Item name="avatar" style={{ marginBottom: 0 }}>
                                        <Upload
                                            beforeUpload={() => false}
                                            maxCount={1}
                                            listType="picture-card"
                                            showUploadList={false}
                                            onChange={handleUploadChange}
                                        >
                                            {imageUrl ? (
                                                <img src={imageUrl} alt="avatar" style={{ width: '100%', borderRadius: '4px' }} />
                                            ) : (
                                                <div>
                                                    <UploadOutlined />
                                                    <div style={{ marginTop: 8 }}>Ảnh đại diện</div>
                                                </div>
                                            )}
                                        </Upload>
                                    </Form.Item>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Định dạng JPG, PNG (Tối đa 2MB)</Text>
                                </Card>

                                {/* Card Quyền hạn */}
                                <Card bordered={false} title="Cấu hình tài khoản" style={{ borderRadius: 8 }}>
                                    <Form.Item
                                        name="password"
                                        label="Mật khẩu khởi tạo"
                                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }, { min: 6, message: "Tối thiểu 6 ký tự" }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item name="role" label="Quyền hệ thống" initialValue="staff">
                                        <Select options={[
                                            // { value: "manager", label: "Quản lý" },
                                            { value: "staff", label: "Nhân viên" }
                                        ]} />
                                    </Form.Item>

                                    <Divider style={{ margin: '12px 0' }} />

                                    <Row justify="space-between" align="middle">
                                        <Text>Trạng thái hoạt động</Text>
                                        <Form.Item name="isActive" valuePropName="checked" initialValue={true} noStyle>
                                            <Switch checkedChildren="Mở" unCheckedChildren="Khóa" />
                                        </Form.Item>
                                    </Row>
                                </Card>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </div>
        </div>
    );
};

export default CreateAccount;