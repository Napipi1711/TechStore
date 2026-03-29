import React, { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Table, Card, Typography, Tag, Space, Button, DatePicker } from "antd";
import { toast } from "react-toastify";
import { getAllPurchasesApi } from "../../api/customerApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function CustomerPurchases() {
    const { id } = useParams(); // customerId
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy ngày từ URL query
    const initialStartDate = searchParams.get("startDate");
    const initialEndDate = searchParams.get("endDate");

    const fetchCustomerPurchases = async (startDate, endDate) => {
        setLoading(true);
        try {
            // Truyền query params ngày tới API
            const query = {};
            if (startDate) query.startDate = startDate;
            if (endDate) query.endDate = endDate;

            const res = await getAllPurchasesApi(query);
            const allPurchases = res.data.purchases || [];

            // Lọc đơn hàng theo customerId
            const customerPurchases = allPurchases.filter(
                (p) => p.customerId && p.customerId._id === id
            );

            setPurchases(customerPurchases);

            if (customerPurchases.length > 0) {
                setCustomerName(customerPurchases[0].customerId?.name || "Khách hàng");
            }
        } catch (err) {
            console.error("Error fetching customer purchases:", err);
            toast.error("Không thể tải đơn hàng của khách hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerPurchases(initialStartDate, initialEndDate);
    }, [id, initialStartDate, initialEndDate]);

    const handleDateChange = (dates) => {
        if (!dates || dates.length !== 2) {
            setSearchParams({});
            return;
        }

        const [start, end] = dates;
        const startDate = start.format("YYYY-MM-DD");
        const endDate = end.format("YYYY-MM-DD");

        // Cập nhật URL query params
        setSearchParams({ startDate, endDate });

        // Fetch dữ liệu theo ngày
        fetchCustomerPurchases(startDate, endDate);
    };

    // Columns cho bảng đơn hàng chính
    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "_id",
            key: "_id",
            render: (text) => <Text copyable>{text}</Text>,
        },
        {
            title: "Mã bán",
            dataIndex: "saleCode",
            key: "saleCode",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (text) => <Text strong>${Number(text).toLocaleString()}</Text>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (text) => {
                let color = "blue";
                if (text === "paid") color = "green";
                else if (text === "canceled") color = "red";
                return <Tag color={color} style={{ textTransform: "uppercase", fontWeight: "bold" }}>{text}</Tag>;
            },
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false} className="shadow-sm">
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Title level={3} style={{ marginBottom: 0 }}>
                        Đơn hàng của khách: {customerName || "Khách hàng"}
                    </Title>
                    <Button type="link" style={{ paddingLeft: 0 }}>
                        <Link to="/customer">← Quay lại danh sách khách hàng</Link>
                    </Button>

                    {/* Chọn lọc ngày */}
                    <RangePicker
                        onChange={handleDateChange}
                        value={
                            initialStartDate && initialEndDate
                                ? [dayjs(initialStartDate), dayjs(initialEndDate)]
                                : []
                        }
                        style={{ marginTop: 8 }}
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={purchases}
                    rowKey="_id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    style={{ marginTop: 16 }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div style={{ padding: "8px 16px", backgroundColor: "#fafafa", borderRadius: "8px" }}>
                                <Title level={5}>Chi tiết sản phẩm</Title>
                                <Table
                                    columns={[
                                        {
                                            title: "Sản phẩm",
                                            dataIndex: ["product", "name"],
                                            key: "name",
                                            render: (text, item) => <Text strong>{item.product?.name || "N/A"}</Text>,
                                        },
                                        {
                                            title: "Số lượng",
                                            dataIndex: "quantity",
                                            key: "quantity",
                                            align: "center",
                                        },
                                        {
                                            title: "Giá bán",
                                            dataIndex: "price",
                                            key: "price",
                                            render: (text) => <Text>${Number(text).toLocaleString()}</Text>,
                                        },
                                        {
                                            title: "Tổng",
                                            dataIndex: "lineTotal",
                                            key: "lineTotal",
                                            render: (text) => <Text strong>${Number(text).toLocaleString()}</Text>,
                                        },
                                    ]}
                                    dataSource={record.items || []}
                                    pagination={false}
                                    rowKey={(item) => item.product?._id || Math.random()}
                                    size="small"
                                />
                            </div>
                        ),
                    }}
                />
            </Card>
        </div>
    );
}