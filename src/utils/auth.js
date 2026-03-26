import api from "../lib/api";
import { toast } from "react-hot-toast";

export const login = async (email, password) => {
  try {
    console.log("[AUTH] Attempting login for:", email);
    
    // Call backend API for admin login
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    if (!response.data.success) {
      console.log("[AUTH] Login failed:", response.data.error);
      throw new Error(response.data.error || "Login failed");
    }

    console.log("[AUTH] Login successful!");
    
    const { token, refresh_token, expires_in, admin } = response.data.data;
    console.log("[AUTH] Token received, expires_in:", expires_in, "seconds");
    console.log("[AUTH] Admin:", admin.username, "Role:", admin.role);
    
    // Use expires_in from backend (in seconds) - convert to milliseconds
    const expiresIn = expires_in ? expires_in * 1000 : 3600000;

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
  
  console.log("[AUTH] Attempting to restore session...");
  
  if (!refreshToken) {
    console.log("[AUTH] No refresh token found");
    return null;
  }
  
  try {
    // Call backend API to refresh token
    const response = await api.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    
    if (!response.data.success) {
      console.log("[AUTH] Session refresh failed:", response.data.error);
      return null;
    }
    
    console.log("[AUTH] Session refreshed successfully!");
    
    const { token, refresh_token, expires_in } = response.data.data;
    console.log("[AUTH] New token expires_in:", expires_in, "seconds");
    
    // Use expires_in from backend (in seconds) - convert to milliseconds
    const expiresIn = expires_in ? expires_in * 1000 : 3600000;
    
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
