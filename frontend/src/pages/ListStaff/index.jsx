import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import listStaffApi from "../../api/liststaffApi";

export default function ListStaff() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await listStaffApi.getAll({ page: 1, limit: 10 });
      setStaffs(res.data?.users || []);
    } catch (error) {
      console.error(" Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (staff) => {
    // 👉 chuyển sang route mới
    navigate(`/staff/${staff._id}`);
  };

  return (
    <div className="w-full py-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 px-2">
        Danh sách nhân viên
      </h2>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-gray-600">
            <th className="px-4 py-3 text-sm font-semibold w-16">STT</th>
            <th className="px-4 py-3 text-sm font-semibold">Họ và tên</th>
            <th className="px-4 py-3 text-sm font-semibold">SĐT</th>
            <th className="px-4 py-3 text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-sm font-semibold">Chi nhánh</th>
            <th className="px-4 py-3 text-sm font-semibold">Vai trò</th>
            <th className="px-4 py-3 text-sm font-semibold text-center">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td colSpan="7" className="px-4 py-10 text-center text-gray-400">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : staffs.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-10 text-center text-gray-500">
                Không có dữ liệu nhân viên.
              </td>
            </tr>
          ) : (
            staffs.map((staff, index) => (
              <tr key={staff._id || index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-blue-600 font-medium">
                  {staff.name}
                </td>
                <td className="px-4 py-3">{staff.phone || "---"}</td>
                <td className="px-4 py-3">{staff.email || "---"}</td>
                <td className="px-4 py-3">
                  {staff.branches?.map((b, i) => (
                    <div key={i}>{b.branch?.name}</div>
                  ))}
                </td>
                <td className="px-4 py-3 italic">
                  {staff.roleInBranch || "staff"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleOpenDetail(staff)}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Chi tiết
                  </button>
                  
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}