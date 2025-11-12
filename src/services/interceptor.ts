import axios from "axios";
import loadingService from "@/services/loadingService";

const api = axios.create({
  baseURL: "https://solar-api-9v6r.onrender.com",
});

api.interceptors.request.use(
  (config) => {
    loadingService.show();
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    loadingService.hide();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    loadingService.hide();
    return response;
  },
  (error) => {
    loadingService.hide();
    return Promise.reject(error);
  }
);

export default api;
