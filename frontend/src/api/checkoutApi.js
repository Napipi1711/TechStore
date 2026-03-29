import axiosInstance from "../utils/axios";

export const checkoutApi = (data) => {
    return axiosInstance.post("/staff/pos/checkout", data);
};