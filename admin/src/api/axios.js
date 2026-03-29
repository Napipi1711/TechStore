import axios from "axios"; //axiosInstance

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // vd: http://localhost:5000/api
  timeout: 10000,
});

/* Gắn token cho request (trừ login) */
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Xử lý lỗi chung */
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;
