
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import accountApi from "../../api/accountApi";
import {
    ArrowLeftOutlined,
    CloudUploadOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined
} from "@ant-design/icons";

const UpdateAccount = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "male",
        dob: "",
        address: "",
        isActive: true,
    });

    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await accountApi.getById(id);
                const data = res.data;

                setFormData({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    gender: data.gender || "male",
                    dob: data.dob ? data.dob.split("T")[0] : "",
                    address: data.address || "",
                    isActive: Boolean(data.isActive),
                });

                setPreview(data.avatar || "");
            } catch (err) {
                console.error("Lỗi fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("phone", formData.phone);
        data.append("gender", formData.gender);
        data.append("dob", formData.dob);
        data.append("address", formData.address);
        data.append("isActive", JSON.stringify(formData.isActive));

        if (selectedFile) data.append("avatar", selectedFile);

        try {
            await accountApi.update(id, data);
            navigate("/admin/accounts");
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-64 text-gray-500 italic">
                Đang tải dữ liệu hồ sơ...
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-2 text-sm font-medium"
                    >
                        <ArrowLeftOutlined /> Quay lại hồ sơ
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Cập nhật tài khoản</h1>
                    <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest">
                        Mã định danh: {id}
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-all"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-100 border-4 border-white shadow-sm transition-all group-hover:shadow-md">
                            <img
                                src={preview || "https://via.placeholder.com/150"}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label className="absolute -bottom-3 -right-3 cursor-pointer bg-white w-12 h-12 flex items-center justify-center rounded-xl shadow-lg border border-gray-100 text-blue-600 hover:text-blue-700 transition-transform hover:scale-110">
                            <CloudUploadOutlined style={{ fontSize: "20px" }} />
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </label>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm font-medium text-gray-500">Ảnh đại diện</p>
                        <p className="text-xs text-gray-400 max-w-[200px] mt-2">
                            Định dạng hỗ trợ: JPG, PNG. Tối đa 2MB.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">
                            Thông tin cơ bản
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                    <UserOutlined /> HỌ VÀ TÊN
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                    <MailOutlined /> EMAIL (KHÔNG ĐỔI)
                                </label>
                                <input
                                    value={formData.email}
                                    disabled
                                    className="w-full px-0 py-2 border-b-2 border-gray-100 bg-transparent text-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                    <PhoneOutlined /> SỐ ĐIỆN THOẠI
                                </label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">GIỚI TÍNH</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent font-medium"
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-b border-blue-100 pb-2">
                            Địa chỉ & Liên hệ
                        </h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500">NGÀY SINH</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                <HomeOutlined /> ĐỊA CHỈ THƯỜNG TRÚ
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="1"
                                className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent resize-none font-medium"
                            />
                        </div>

                        <label className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="sr-only peer"
                            />

                            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition">
                                <span className="absolute left-[2px] top-[2px] h-5 w-5 bg-white border rounded-full transition-transform peer-checked:translate-x-5"></span>
                            </div>

                            <span className="text-sm font-semibold text-blue-800">
                                Trạng thái tài khoản đang hoạt động
                            </span>
                        </label>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UpdateAccount;

