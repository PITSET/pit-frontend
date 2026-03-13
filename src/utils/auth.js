import api from "../lib/api";
import { toast } from "react-hot-toast";

export const login = async (email, password) => {
  try {
    // Call backend API for admin login
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (!response.data.success) {
      throw new Error(response.data.error || "Login failed");
    }

    const { token, refresh_token, admin } = response.data.data;
    const expiresIn = 3600000; // Default 1 hour (backend should provide this)

    // Store token
    localStorage.setItem("token", token);
    
    // Store session expiry time
    const expiryTime = Date.now() + expiresIn;
    localStorage.setItem("sessionExpiry", expiryTime.toString());

    // Store refresh token for session persistence
    if (refresh_token) {
      localStorage.setItem("refreshToken", refresh_token);
    }

    // Store admin info
    localStorage.setItem("admin", JSON.stringify(admin));

    return { token, admin, expiresIn };
  } catch (error) {
    console.error("Login error:", error);
    // Re-throw to let the caller handle it
    throw error;
  }
};

export const logout = async (showNotification = false) => {
  try {
    // Call backend API for logout
    await api.post("/auth/logout");
  } catch (error) {
    // Continue with local logout even if API fails
    console.error("Logout API error:", error);
  }
  
  // Clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("sessionExpiry");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("admin");
  
  if (showNotification) {
    toast.error("Your session has expired. Please login again.");
  }
  
  // Delay redirect to allow toast to show
  setTimeout(() => {
    window.location.href = "/admin/login";
  }, 2000);
};

export const isAuthenticated = () => {
  // Just check if token exists
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

// Get stored admin info
export const getAdmin = () => {
  const adminStr = localStorage.getItem("admin");
  if (!adminStr) return null;
  try {
    return JSON.parse(adminStr);
  } catch {
    return null;
  }
};

// Restore session using refresh token
export const restoreSession = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    // Call backend API to refresh token
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    
    if (!response.data.success) {
      return null;
    }
    
    const { token, refresh_token } = response.data.data;
    const expiresIn = 3600000; // Default 1 hour
    
    // Update stored token and expiry
    localStorage.setItem("token", token);
    const expiryTime = Date.now() + expiresIn;
    localStorage.setItem("sessionExpiry", expiryTime.toString());
    
    if (refresh_token) {
      localStorage.setItem("refreshToken", refresh_token);
    }
    
    return { access_token: token };
  } catch (error) {
    console.error("Session refresh error:", error);
    return null;
  }
};

// Check session validity and auto-logout if expired
export const checkSession = () => {
  const expiry = localStorage.getItem("sessionExpiry");
  
  // If no expiry stored, session is still valid
  if (!expiry) {
    return true;
  }
  
  if (Date.now() > parseInt(expiry)) {
    logout(true);
    return false;
  }
  
  return true;
};
