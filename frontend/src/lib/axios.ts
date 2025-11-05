// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Create a global axios instance
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  withCredentials: true,
});

// ✅ Token refresh interceptor (optional)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const { useAuth } = await import("@clerk/clerk-react");
        const { getToken } = useAuth();
        const newToken = await getToken();
        if (newToken) {
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          error.config.headers.Authorization = `Bearer ${newToken}`;
          console.log("Token refreshed, retrying request...");
          return axiosInstance(error.config);
        }
      } catch (refreshError) {
        console.log("Token refresh failed", refreshError);
      }
      delete axiosInstance.defaults.headers.common["Authorization"];
      console.error("Authentication failed. Please sign in again.");
    }
    return Promise.reject(error);
  }
);
