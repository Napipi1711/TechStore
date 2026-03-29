import api from "../utils/axios";

export const loginApi = (data) => {
  return api.post("/users/login", data);
};

export const registerApi = (data) => {
  return api.post("/users/register", data);
};

export const getMeApi = () => {
  return api.get("/users/profile"); 
};