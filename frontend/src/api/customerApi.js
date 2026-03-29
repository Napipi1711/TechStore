import axiosInstance from "../utils/axios";

// tạo khách hàng mới
export const createCustomerApi = (data) => {
    return axiosInstance.post("/staff/viewcustomer", data);
};

// lấy khách hàng theo id
export const getCustomerByIdApi = (id) => {
    return axiosInstance.get(`/staff/viewcustomer/id/${id}`);
};

// lấy khách hàng theo số điện thoại
export const getCustomerByPhoneApi = (phone) => {
    return axiosInstance.get("/staff/viewcustomer/phone", {
        params: { phone },
    });
};

// lấy tất cả khách hàng (nếu muốn filter bằng query params)
export const getCustomersApi = (params = {}) => {
    return axiosInstance.get("/staff/viewcustomer", { params });
};

export const getAllPurchasesApi = () => {
    return axiosInstance.get("/staff/viewcustomer/purchases/all");
};