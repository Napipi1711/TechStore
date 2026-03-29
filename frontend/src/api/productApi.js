import axiosInstance from "../utils/axios";
// manager
const productApi = {
  getAll: () => {
    return axiosInstance.get("/manager/product");
  },

  getById: (id) => {
    return axiosInstance.get(`/manager/product/${id}`);
  },
};

export default productApi;