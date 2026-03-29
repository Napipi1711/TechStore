import axios from "./axios";

const supplierApi = {

    // Có thể truyền params { name: "abc" } để filter
    getAll: (params = {}) => axios.get("/admin/suppliers", { params }),

    create: (data) => {
        console.group(" [API] POST /admin/suppliers");
        console.log("Payload:", data);
        console.groupEnd();
        return axios.post("/admin/suppliers", data);
    },

    getById: (id) => axios.get(`/admin/suppliers/${id}`),

    update: (id, data) => {
        console.group(` [API] PUT /admin/suppliers/${id}`);
        console.log("Update Data:", data);
        console.groupEnd();
        return axios.put(`/admin/suppliers/${id}`, data);
    },

    remove: (id) => axios.delete(`/admin/suppliers/${id}`),
};

export default supplierApi;