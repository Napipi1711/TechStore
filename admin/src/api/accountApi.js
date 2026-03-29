import axios from "./axios";

const accountApi = {
  /**
   * Lấy danh sách user
   * @param {Object} params - Có thể gồm branchId, role, search
   */
  getAll(params = {}) {
    return axios.get("/admin/accounts", { params });
  },

  /**
   * Lấy 1 user theo id
   * @param {string} id
   */
  getById(id) {
    return axios.get(`/admin/accounts/${id}`);
  },

  /**
   * Tạo user mới
   * @param {FormData} data
   */
  create(data) {
    return axios.post("/admin/accounts", data);
  },

  /**
   * Cập nhật user
   * @param {string} id
   * @param {FormData} data
   */
  update(id, data) {
    return axios.put(`/admin/accounts/${id}`, data);
  },

  /**
   * Xóa user
   * @param {string} id
   */
  delete(id) {
    return axios.delete(`/admin/accounts/${id}`);
  },

  /**
   * Lấy danh sách chi nhánh để chọn lọc
   */
  getBranches() {
    return axios.get("/admin/branches");
  },
};

export default accountApi;