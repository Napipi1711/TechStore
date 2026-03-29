import axios from "./axios";

const productApi = {
  getAll: (params = {}) => {
    return axios.get("/admin/products", { params });
  },

  getById: (id) => {
    return axios.get(`/admin/products/${id}`);
  },

  create: (formData) => {
    return axios.post("/admin/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: (id, formData) => {
    return axios.put(`/admin/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id) => {
    return axios.delete(`/admin/products/${id}`);
  },
};

export default productApi;
