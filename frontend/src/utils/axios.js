import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*REQUEST INTERCEPTOR */
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE === "development") {
      console.log(
        `[Response] ${response.status} <- ${response.config.url}`
      );
    }
    return response;
  },
  (error) => {
    if (import.meta.env.MODE === "development") {
      console.error(
        `[Error] ${error.response?.status} <- ${error.config?.url}`
      );
    }

    const status = error.response?.status;
    const url = error.config?.url || "";

    // Routes không cần redirect 
    const authRoutes = [
      "/users/login",
      "/users/register",
      "/users/forgot-password",
      "/users/reset-password",
    ];
    const isAuthRequest = authRoutes.some((route) => url.includes(route));

    // Redirect  401 hoặc 400 
    if ((status === 401 || status === 400) && !isAuthRequest) {
      console.warn(`Request failed with ${status} → redirecting to /login`);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Không có quyền
    if (status === 403) {
      window.location.href = "/NotFound";
    }

    return Promise.reject(error);
  }
);
/* RESPONSE INTERCEPTOR */
axiosInstance.interceptors.response.use(
  (response) => {

    if (import.meta.env.MODE === "development") {
      console.log(
        `[Response] ${response.status} <- ${response.config.url}`
      );
    }

    return response;
  },

  (error) => {

    if (import.meta.env.MODE === "development") {
      console.error(
        `[Error] ${error.response?.status} <- ${error.config?.url}`
      );
    }

    const status = error.response?.status;
    const url = error.config?.url || "";

    /*
       TOKEN HẾT HẠN */
    // KHÔNG redirect khi login/register
    const authRoutes = [
      "/users/login",
      "/users/register",
      "/users/forgot-password",
      "/users/reset-password",
    ];

    const isAuthRequest = authRoutes.some((route) =>
      url.includes(route)
    );

    if (status === 401 && !isAuthRequest) {
      console.warn("Token expired → logging out");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    /*KHÔNG CÓ QUYỀN*/

    if (status === 403) {
      window.location.href = "/NotFound";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;