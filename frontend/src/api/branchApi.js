import axiosInstance from "../utils/axios";

export const getMyBranchApi = () => {
    return axiosInstance.get("/manager/branch"); //manager sử dụng 
};