import axios from "../utils/axios";

const supplierApi = {
  getAll: () => axios.get("/manager/suppliers"), // cho thằng manager
};

export default supplierApi;