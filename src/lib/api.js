import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/auth/login")
    ) {
      console.warn("Unauthorized. Logging out...");
      
      // Show session expired toast
      toast.error("Your session has expired. Please login again.");
      
      // Remove token and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("sessionExpiry");
      localStorage.removeItem("refreshToken");
      
      // Delay redirect to allow toast to show
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 2000);
    }

    // Handle 403 Forbidden (admin access denied)
    if (error.response && error.response.status === 403) {
      const errorMessage = error.response.data?.error || "Access denied";
      
      // Show error toast
      toast.error(errorMessage);
      
      // If account is deactivated, redirect to login
      if (errorMessage.includes("deactivated")) {
        localStorage.removeItem("token");
        localStorage.removeItem("sessionExpiry");
        localStorage.removeItem("refreshToken");
        
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
