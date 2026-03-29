import axiosInstance from "../utils/axios";

const revenueApi = {
  /**
   * Dashboard Manager
   * @param {Object} params
   * - from: YYYY-MM-DD
   * - to: YYYY-MM-DD
   * - groupBy: day | week | month | year
   */
  getDashboard(params) {
    return axiosInstance.get("/manager/dashboard", { params });
  },
  exportReport(params) {
    return axiosInstance.get("/manager/dashboard/export", { params });
  },
};

export default revenueApi;