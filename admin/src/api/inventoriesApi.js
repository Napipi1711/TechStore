import axios from "./axios";

const inventoriesApi = {
  // GET tất cả inventory (có thể filter theo branchId qua query param)
  getAll(params = {}) {
    return axios.get(`/admin/inventories`, { params });
  },

  // GET inventory của một chi nhánh cụ thể
  getByBranch(branchId) {
    return axios.get(`/admin/inventories`, { params: { branchId } });
  },

  // GET chi tiết sản phẩm trong kho một chi nhánh
  getDetails(branchId, productId) {
    return axios.get(`/admin/inventories/${branchId}/${productId}/details`);
  },
};

export default inventoriesApi;