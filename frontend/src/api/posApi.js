import axiosInstance from "../utils/axios";

export const getCategoriesApi = () => {
  return axiosInstance.get("/staff/pos/categories");
};

export const getProductsApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/products", { params });
};

export const searchProductsApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/search", { params });
};

export const getPosProductsApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/products", { params });
};

export const checkoutPosApi = (data) => {
  return axiosInstance.post("/staff/pos/checkout", data);
};

export const confirmQRPaymentApi = (saleId) => {
  return axiosInstance.get(`/staff/pos/confirm-qr/${saleId}`);
};

export const getPaymentStatusApi = (saleId) => {
  return axiosInstance.get(`/staff/pos/payment-status/${saleId}`);
};

// export const checkPaymentStatusApi = (saleId) => {
//   return axiosInstance.get(`/staff/pos/payment-status/${saleId}`);
// };

export const getSaleDetailsApi = (productId, params = {}) => {
  return axiosInstance.get(`/staff/pos/sales/product/${productId}`, { params });
};
export const getStaffSaleHistoryApi = (params = {}) => {
  return axiosInstance.get("/staff/pos/viewHistory", { params });
};
export const getStaffByBranchApi = (branchId) => {
  return axiosInstance.get(`/staff/pos/staff-by-branch/${branchId}`);
};