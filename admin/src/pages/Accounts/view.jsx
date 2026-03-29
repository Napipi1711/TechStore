import React, { useEffect, useState } from "react";
import {
    Descriptions,
    Card,
    Avatar,
    Tag,
    Spin,
    List,
    Typography,
    Button,
    Row,
    Col,
    Divider
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import {
    UserOutlined,
    EnvironmentOutlined,
    ArrowLeftOutlined,
    MailOutlined,
    PhoneOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

const ViewAccount = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        accountApi.getById(id)
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading)
        return (
            <div style={{ textAlign: "center", padding: "50px" }}>
                <Spin size="large" tip="Đang tải..." />
            </div>
        );

    if (!data) return <Card bordered={false}>Không tìm thấy dữ liệu tài khoản.</Card>;

    return (
        <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>

            {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                    type="link"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    style={{ padding: 0 }}
                >
                    Quay lại danh sách
                </Button>
                <Tag color={data.isActive ? "green" : "red"}>
                    {data.isActive ? "ĐANG HOẠT ĐỘNG" : "BỊ KHÓA"}
                </Tag>
            </div>

            <Row gutter={[24, 24]}>
                {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
                <Col xs={24} md={8}>
                    <Card bordered={false} style={{ textAlign: "center", background: 'transparent' }}>
                        <Avatar
                            size={140}
                            src={data.avatar}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: '#f0f2f5',
                                border: "1px solid #d9d9d9",
                                marginBottom: 16
                            }}
                        />
                        <Title level={3} style={{ marginBottom: 4 }}>{data.name}</Title>
                        <Text type="secondary">{data.userCode}</Text>
                        <div style={{ marginTop: 12 }}>
                            <Tag color="purple">{data.role?.toUpperCase()}</Tag>
                        </div>

                        <Divider style={{ margin: '20px 0' }} />

                        <div style={{ textAlign: 'left' }}>
                            <div style={{ marginBottom: 12 }}>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                    <MailOutlined /> email cá nhân
                                </Text>
                                <Text strong>{data.email}</Text>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                    <PhoneOutlined />  Số điện thoại
                                </Text>
                                <Text strong>{data.phone || "Chưa cập nhật"}</Text>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                    <EnvironmentOutlined /> Địa chỉ thường trú
                                </Text>
                                <Text strong>{data.address || "Chưa cập nhật"}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* CỘT PHẢI: CHI TIẾT VÀ CHI NHÁNH */}
                <Col xs={24} md={16}>
                    <Card title="Thông tin chi tiết" bordered={false}>
                        <Descriptions column={2}>
                            <Descriptions.Item label="Giới tính">
                                {data.gender === "male" ? "Nam" : data.gender === "female" ? "Nữ" : "Khác"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày sinh">
                                {data.dob ? new Date(data.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ marginTop: 40 }}>
                            Chi nhánh trực thuộc
                        </Divider>

                        <List
                            itemLayout="horizontal"
                            dataSource={data.branches || []}
                            locale={{ emptyText: "Chưa được gán chi nhánh nào" }}
                            renderItem={(item) => (
                                <List.Item> {/* Đã xóa phần extra ở đây */}
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                shape="square"
                                                icon={<EnvironmentOutlined />}
                                                style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }}
                                            />
                                        }
                                        title={<Text strong>{item.branchId?.name || "Chi nhánh"}</Text>}
                                        description={`Vai trò: ${item.role}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ViewAccount;