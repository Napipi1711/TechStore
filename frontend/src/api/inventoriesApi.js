import axiosInstance from "../utils/axios";

const inventoriesApi = {
  getAll() {
    return axiosInstance.get("/inventories");
  },

  /**
   * @param {string} productId 
   * @param {object} filters - { type, source, startDate, endDate, ... }
   */
  getDetails(productId, filters = {}) {
    // Chuyển object filters -> query string
    const params = new URLSearchParams(filters).toString();
    const url = `/inventories/${productId}/details${params ? `?${params}` : ""}`;
    return axiosInstance.get(url);
  },
};

export default inventoriesApi;