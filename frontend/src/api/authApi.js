import axiosInstance from "../utils/axios";

export const loginApi = (data) => {
  console.log("LOGIN DATA SEND:", data);
  return axiosInstance.post("/users/login", data);
};

export const getProfileApi = () => {
  return axiosInstance.get("/users/profile");
};

export const forgotPasswordApi = (data) => {
  return axiosInstance.post("/users/forgot-password", data);
};

export const resetPasswordApi = (token, data) => {
  return axiosInstance.post(`/users/reset-password/${token}`, data);
};