import axios from "./axios";

const loginApi = {
  login: async (credentials) => {
    try {
      const res = await axios.post("/users/login", credentials);
      return res.data;
    } catch (error) {
      throw error.response?.data || new Error("Kết nối server thất bại");
    }
  },
};

export default loginApi;
