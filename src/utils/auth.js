import api from "../lib/api";
import { toast } from "react-hot-toast";

// Session duration in milliseconds (default: 30 minutes)
// This should match the backend token expiry time
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const login = async (email, password) => {
  const res = await api.post("/auth/login", {
    email,
    password,
  });

  const { token, user, expiresIn } = res.data;

  // store token
  localStorage.setItem("token", token);
  
  // Store session expiry time
  const expiryTime = Date.now() + (expiresIn || SESSION_DURATION);
  localStorage.setItem("sessionExpiry", expiryTime.toString());

  return { token, user };
};

export const logout = (showNotification = false) => {
  localStorage.removeItem("token");
  localStorage.removeItem("sessionExpiry");
  
  if (showNotification) {
    toast.error("Your session has expired. Please login again.");
  }
  
  // Delay redirect to allow toast to show
  setTimeout(() => {
    window.location.href = "/admin/login";
  }, 2000);
};

export const isAuthenticated = () => {
  // Just check if token exists (for backward compatibility with old logins)
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  return localStorage.getItem("token");
};

// Check session validity and auto-logout if expired
export const checkSession = () => {
  const expiry = localStorage.getItem("sessionExpiry");
  
  // If no expiry stored, session is still valid (backward compatibility)
  if (!expiry) {
    return true;
  }
  
  if (Date.now() > parseInt(expiry)) {
    logout(true);
    return false;
  }
  
  return true;
};
