import axios from "./axios";

const activityApi = {

  getAll: () => {
    console.group(" [API] GET /admin/audit-logs");
    console.groupEnd();
    return axios.get("/admin/audit-logs");
  },

  getWithFilter: (params) => {
    console.group(" [API] GET /admin/audit-logs (Filtered)");
    console.log("Query Params:", params);
    console.groupEnd();
    return axios.get("/admin/audit-logs", { params });
  },

  getDetails: (id) => {
    if (!id) {
      console.warn("activityApi.getDetails called without id");
      return Promise.reject(new Error("ID is required"));
    }
    console.group(` [API] GET /admin/audit-logs/${id}`);
    console.groupEnd();
    return axios.get(`/admin/audit-logs/${id}`);
  }

};

export default activityApi;