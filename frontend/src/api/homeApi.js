import axiosInstance from "../utils/axios";


export const getHomeProductsApi = (params = {}) => {
  return axiosInstance.get("/home/products", { params });
};
export const getCategoriesApi = () => {
  return axiosInstance.get("/home/categories");
};

export const getProductsApi = (params = {}) => {
  return axiosInstance.get("/home/products", { params });
};
export const searchProductsApi = (params = {}) => {
  return axiosInstance.get("/home/products/search", { params });
};