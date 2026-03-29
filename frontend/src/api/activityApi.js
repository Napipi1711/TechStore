import axiosInstance from "../utils/axios";

const activityApi = {
  getAll(params) {
    return axiosInstance.get("/manager/activity-logs", { params });
  },

  getDetail(id) {
    return axiosInstance.get(`/manager/activity-logs/${id}`);
  },
};

export default activityApi;