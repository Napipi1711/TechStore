import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, Modal, message, Avatar, Select, Input } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import accountApi from "../../api/accountApi";

const { Option } = Select;

const AccountList = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [filterBranch, setFilterBranch] = useState("");
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy danh sách branch
    const fetchBranches = async () => {
        try {
            const res = await accountApi.getBranches();
            setBranches(res.data.branches);
        } catch (err) { console.log(err); }
    };

    // Lấy user theo params
    const fetchUsers = async (params = {}) => {
        setLoading(true);
        try {
            const res = await accountApi.getAll(params);
            setUsers(res.data.users);
        } catch (err) {
            message.error("Không thể tải danh sách");
        } finally { setLoading(false); }
    };

    // Khi component mount: lấy query params từ URL
    useEffect(() => {
        fetchBranches();

        const query = new URLSearchParams(location.search);
        const branchId = query.get("branchId") || "";
        const search = query.get("search") || "";

        setFilterBranch(branchId);
        setSearchText(search);

        fetchUsers({ branchId, search });
    }, [location.search]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Xác nhận xóa?",
            content: "Dữ liệu liên quan đến chi nhánh cũng sẽ bị xóa.",
            onOk: async () => {
                try {
                    await accountApi.delete(id);
                    message.success("Đã xóa");
                    fetchUsers({ branchId: filterBranch, search: searchText });
                } catch (error) { message.error("Lỗi khi xóa"); }
            },
        });
    };

    const handleSearch = () => {
        // Cập nhật URL query params
        const params = new URLSearchParams();
        if (filterBranch) params.set("branchId", filterBranch);
        if (searchText) params.set("search", searchText);
        navigate({ pathname: "/admin/accounts", search: params.toString() });
        // fetchUsers sẽ tự động gọi do useEffect dựa vào location.search
    };

    const columns = [
        { title: "Avatar", dataIndex: "avatar", render: (src) => <Avatar src={src} size="large" /> },
        { title: "Họ tên", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Branches",
            dataIndex: "branches",
            render: (branches) => (
                <>
                    {branches.map(b => (
                        <Tag color="purple" key={b.branch._id}>{b.branch.name} ({b.role})</Tag>
                    ))}
                </>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "isActive",
            render: (active) => <Tag color={active ? "green" : "red"}>{active ? "Đang hoạt động" : "Khóa"}</Tag>,
        },
        {
            title: "Thao tác",
            render: (_, record) => (
                <Space>
                    <Button icon={<EyeOutlined />} onClick={() => navigate(`/admin/accounts/view/${record._id}`)} />
                    <Button icon={<EditOutlined />} type="primary" onClick={() => navigate(`/admin/accounts/update/${record._id}`)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record._id)} />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Quản lý tài khoản</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/accounts/create")}> Thêm mới </Button>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: 16, display: "flex", gap: "10px" }}>
                <Select
                    placeholder="Chọn chi nhánh"
                    style={{ width: 180 }}
                    value={filterBranch}
                    onChange={setFilterBranch}
                    allowClear
                >
                    {branches.map(b => <Option key={b._id} value={b._id}>{b.name}</Option>)}
                </Select>

                <Input
                    placeholder="Tìm tên hoặc email"
                    style={{ width: 200 }}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />

                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}> Tìm kiếm </Button>
            </div>

            <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} />
        </div>
    );
};

export default AccountList;