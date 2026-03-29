import axiosInstance from "../utils/axios";

export const getInvoiceByIdApi = (saleId) => {
    return axiosInstance.get(`/staff/invoices/invoice/${saleId}`);
};