import axiosInstance from "../utils/axios";

const purchaseApi = { // cho thằng manager
  getAll: (params) => axiosInstance.get("/manager/purchases", { params }),

  getById: (id) => axiosInstance.get(`/manager/purchases/${id}`),

  create: (data) => axiosInstance.post("/manager/purchases", data),

  update: (id, data) => axiosInstance.put(`/manager/purchases/${id}`, data),

  confirm: (id) => axiosInstance.patch(`/manager/purchases/${id}/confirm`),

  cancel: (id) => axiosInstance.patch(`/manager/purchases/${id}/cancel`),

  returnPurchase: (id) => axiosInstance.patch(`/manager/purchases/${id}/return`),

  remove: (id) => axiosInstance.delete(`/manager/purchases/${id}`),
};

export default purchaseApi;