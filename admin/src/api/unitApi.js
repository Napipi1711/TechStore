import axios from "./axios";

const unitApi = {
    // GET /admin/units
    getAll: (params = {}) => {
        return axios.get("/admin/units", { params });
    },

    // GET /admin/units/:id
    getById: (id) => {
        return axios.get(`/admin/units/${id}`);
    },

    // POST /admin/units
    create: (data) => {
        return axios.post("/admin/units", data);
    },

    // PUT /admin/units/:id
    update: (id, data) => {
        return axios.put(`/admin/units/${id}`, data);
    },

    // DELETE /admin/units/:id
    delete: (id) => {
        return axios.delete(`/admin/units/${id}`);
    },
};

export default unitApi;