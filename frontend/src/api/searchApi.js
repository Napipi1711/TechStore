import axiosInstance from "../utils/axios";

const searchApi = {

  searchInventory: (keyword) => {
    return axiosInstance.get(`/staff/pos/search`, {
      params: { keyword }
    });
  },

};

export default searchApi;