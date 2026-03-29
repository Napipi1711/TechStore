import axios from "./axios";

const branchApi = {
    
    getAll: () => axios.get("/admin/branches"),

   
    create: (data) => {
        
        console.group(" [API] POST /admin/branches");
        console.log("Payload:", data);
        console.groupEnd();
        return axios.post("/admin/branches", data);
    },

    
    getById: (id) => axios.get(`/admin/branches/${id}`),

    
    update: (id, data) => {
        console.group(` [API] PUT /admin/branches/${id}`);
        console.log("Update Data:", data);
        console.groupEnd();
        return axios.put(`/admin/branches/${id}`, data);
    },
    remove: (id) => axios.delete(`/admin/branches/${id}`),
};

export default branchApi;