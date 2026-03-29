import axios from "./axios";

const userBranchApi = {
    /**
     * @param {string} branchId 
     */
    getPersonnel: (branchId) => {
        return axios.get(`/admin/user-branches/branch/${branchId}`);
    },
    
    getAssignedUserIds: () => {
        return axios.get("/admin/user-branches/assigned-user-ids");
    },

    assignManager: (data) => {
        console.group("🚀 [API] POST /admin/user-branches/assign-manager");
        console.log("Data:", data);
        console.groupEnd();
        return axios.post("/admin/user-branches/assign-manager", data);
    },

    addStaff: (data) => {
        console.group("👤 [API] POST /admin/user-branches/add-staff");
        console.log("Data:", data);
        console.groupEnd();
        return axios.post("/admin/user-branches/add-staff", data);
    },

    /**
     * @param {string} id 
     */
    remove: (id) => {
        console.group(` [API] DELETE /admin/user-branches/${id}`);
        console.groupEnd();
        return axios.delete(`/admin/user-branches/${id}`);
    },
};

export default userBranchApi;