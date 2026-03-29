import axios from "./axios";

const categoryApi = {
  getAll() {
    return axios.get("/admin/categories");
  },

  getById(id) {
    return axios.get(`/admin/categories/${id}`);
  },

  create(data) {
    return axios.post("/admin/categories", data);
  },
  update(id, data) {
    return axios.put(`/admin/categories/${id}`, data);
  },

  delete(id) {
    return axios.delete(`/admin/categories/${id}`);
  },
};

export default categoryApi;
