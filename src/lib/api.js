import axios from "axios";
import { toast } from "react-hot-toast";
import { parseHttpError, ErrorType } from "./httpErrorHandler";

// Prefer same-origin relative `/api` so Vite's dev proxy can connect frontend ↔ backend
// without CORS configuration. Override with `VITE_API_BASE_URL` when deploying.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
  timeout: 30000, // 30 second timeout
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
    // Parse the error for structured handling
    const parsedError = parseHttpError(error);
    
    // Handle 401 Unauthorized
    if (parsedError.type === ErrorType.AUTH) {
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
      
      return Promise.reject(error);
    }

    // Handle 403 Forbidden (admin access denied)
    if (parsedError.type === ErrorType.FORBIDDEN) {
      const errorMessage = error.response?.data?.error || "Access denied";
      
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
      
      return Promise.reject(error);
    }

    // Handle 404 Not Found - could indicate deleted resources
    if (parsedError.type === ErrorType.NOT_FOUND) {
      console.warn("Resource not found:", error.config?.url);
      // Don't show toast automatically for 404 - let the component handle it
      return Promise.reject(error);
    }

    // Handle 429 Rate Limiting
    if (parsedError.type === ErrorType.RATE_LIMIT) {
      console.warn("Rate limit exceeded");
      toast.error("Too many requests. Please wait a moment and try again.");
      return Promise.reject(error);
    }

    // Handle 500+ Server Errors
    if (parsedError.type === ErrorType.SERVER) {
      console.error("Server error:", error.response?.status, error.response?.data);
      toast.error("Server error. Please try again later.");
      return Promise.reject(error);
    }

    // Handle 409 Conflict (Duplicate entries, etc.)
    // Don't show toast here - let the component handle it with better context
    if (parsedError.type === ErrorType.CONFLICT) {
      console.warn("Conflict error:", error.response?.status, error.response?.data);
      // Reject the error so the component can handle it and show appropriate message
      return Promise.reject(error);
    }

    // Handle Network Errors
    if (parsedError.type === ErrorType.NETWORK) {
      console.error("Network error:", error.message);
      toast.error("Unable to connect to the server. Please check your internet connection.");
      return Promise.reject(error);
    }

    // Handle Timeout Errors
    if (parsedError.type === ErrorType.TIMEOUT) {
      console.error("Request timeout:", error.message);
      toast.error("The request took too long. Please try again.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default api;
