import axios from "./axios";

const brandApi = {
  getAll() {
    return axios.get("/admin/brands");
  },

  getById(id) {
    return axios.get(`/admin/brands/${id}`);
  },

  /**
   * @param {FormData} data
   */
  create(data) {
    return axios.post("/admin/brands", data);
  },

  /**
   * @param {string} id
   * @param {FormData} data
   */
  update(id, data) {
    return axios.put(`/admin/brands/${id}`, data);
  },

  delete(id) {
    return axios.delete(`/admin/brands/${id}`);
  },
};

export default brandApi;
