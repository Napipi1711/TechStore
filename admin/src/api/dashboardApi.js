import axios from "./axios";

const dashboardApi = {
  getDashboard: (params) =>
    axios.get("/admin/dashboard", { params }),
  getTopSelling: (params) =>
    axios.get("/admin/dashboard/top-selling", { params }),
  exportReport: (params) =>
    axios.get("/admin/dashboard/export-report", { params }),
};



export default dashboardApi;