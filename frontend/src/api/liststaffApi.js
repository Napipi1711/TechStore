import axiosInstance from "../utils/axios";

const listStaffApi = {
  getAll(params) {
    return axiosInstance.get("/manager/staff", { params });
  },

  getSaleStatus(params) {
    return axiosInstance.get("/manager/staff/sale-status", { params });
  },
};

export default listStaffApi;