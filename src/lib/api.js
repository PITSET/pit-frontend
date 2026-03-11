import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: apiBaseUrl,
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
    // skip auto logout for login endpoint
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.includes("/auth/login")
    ) {
      console.warn("Unauthorized. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  },
);

export default api;
