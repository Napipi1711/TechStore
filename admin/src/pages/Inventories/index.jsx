import { useEffect, useState, useMemo } from "react";
import { Table, Button, Input, Select, Space, Tag, Tooltip } from "antd";
import { useSearchParams } from "react-router-dom";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import inventoriesApi from "../../api/inventoriesApi.js";
import Details from "./Details";

const { Option } = Select;

export default function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const branchFilterURL = searchParams.get("branchId") || "";
  const searchFilterURL = searchParams.get("search") || "";

  const [branchFilter, setBranchFilter] = useState(branchFilterURL);
  const [searchFilter, setSearchFilter] = useState(searchFilterURL);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await inventoriesApi.getAll({
        branchId: branchFilterURL, // Dùng giá trị từ URL để fetch
        search: searchFilterURL
      });
      setInventories(res.data.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách kho:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBranchFilter(branchFilterURL);
    setSearchFilter(searchFilterURL);
    fetchAll();
  }, [branchFilterURL, searchFilterURL]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (branchFilter) params.set("branchId", branchFilter);
    if (searchFilter) params.set("search", searchFilter);
    setSearchParams(params);
  };

  // Hàm xoá nhanh bộ lọc
  const handleResetFilters = () => {
    setBranchFilter("");
    setSearchFilter("");
    setSearchParams({}); // Xoá sạch params trên URL
  };

  const handleOpenDetails = (inv) => {
    setSelectedData({
      branchId: inv.branchId,
      productId: inv.productId,
      branchName: inv.branch,
      productName: inv.product
    });
    setIsModalOpen(true);
  };

  const branchOptions = useMemo(() => {
    const map = new Map();
    inventories.forEach(inv => {
      if (!map.has(inv.branchId)) {
        map.set(inv.branchId, { id: inv.branchId, name: inv.branch });
      }
    });
    return Array.from(map.values());
  }, [inventories]);

  const columns = [
    { title: "Chi nhánh", dataIndex: "branch", key: "branch", sorter: (a, b) => a.branch.localeCompare(b.branch), width: 150 },
    { title: "Sản phẩm", dataIndex: "product", key: "product", sorter: (a, b) => a.product.localeCompare(b.product), width: 200 },
    { title: "SKU", dataIndex: "sku", key: "sku", width: 150, render: (sku) => <Tag color="blue">{sku}</Tag> },
    { title: "Tồn kho gốc", dataIndex: "totalOriginal", key: "totalOriginal", sorter: (a, b) => a.totalOriginal - b.totalOriginal, width: 120, align: 'right' },
    {
      title: "Tồn còn lại", dataIndex: "totalRemaining", key: "totalRemaining", sorter: (a, b) => a.totalRemaining - b.totalRemaining, width: 120, align: 'right',
      render: (qty) => <span style={{ color: qty < 5 ? '#ff4d4f' : 'inherit', fontWeight: qty < 5 ? 'bold' : 'normal' }}>{qty}</span>
    },
    {
      title: "Chi tiết", key: "details", render: (_, record) =>
        <Button type="link" size="small" onClick={() => handleOpenDetails(record)}>Xem</Button>, width: 100, align: 'center'
    },
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 m-0">Danh sách kho</h1>
          <p className="text-slate-500 text-sm">Quản lý và theo dõi tồn kho các chi nhánh</p>
        </div>

        <Space size="middle">
          {/* Nút Reset Filter */}
          {(branchFilterURL || searchFilterURL) && (
            <Tooltip title="Xoá tất cả bộ lọc">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                danger
                type="text"
              >
                Xoá lọc
              </Button>
            </Tooltip>
          )}

          <Select
            style={{ width: 180 }}
            placeholder="Chọn chi nhánh"
            value={branchFilter || undefined}
            allowClear
            onChange={(value) => setBranchFilter(value)}
          >
            {branchOptions.map(b => (
              <Option key={b.id} value={b.id}>{b.name}</Option>
            ))}
          </Select>

          <Input
            style={{ width: 220 }}
            placeholder="Tìm sản phẩm / SKU..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchFilter}
            allowClear
            onChange={(e) => setSearchFilter(e.target.value)}
            onPressEnter={handleSearch}
          />

          <Button type="primary" onClick={handleSearch} className="shadow-sm">
            Tìm kiếm
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={inventories}
        loading={loading}
        rowKey={record => `${record.branchId}_${record.productId}`}
        scroll={{ x: 900 }}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        className="bg-white rounded-lg shadow-sm"
      />

      <Details
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedData}
      />
    </div>
  );
}