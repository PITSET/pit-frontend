import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

// Session duration in milliseconds (default: 30 minutes)
// This should match the backend token expiry time
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const login = async (email, password) => {
  try {
    // Authenticate with Supabase directly
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    const { session, user } = data;
    const token = session.access_token;
    const expiresIn = session.expires_in * 1000; // Convert to milliseconds

    // Store token
    localStorage.setItem("token", token);
    
    // Store session expiry time
    const expiryTime = Date.now() + (expiresIn || SESSION_DURATION);
    localStorage.setItem("sessionExpiry", expiryTime.toString());

    // Store refresh token for session persistence
    if (session.refresh_token) {
      localStorage.setItem("refreshToken", session.refresh_token);
    }

    return { token, user, expiresIn };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async (showNotification = false) => {
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("sessionExpiry");
  localStorage.removeItem("refreshToken");
  
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

// Restore session using refresh token
export const restoreSession = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  
  if (!refreshToken) {
    return null;
  }
  
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error) {
      console.error("Session refresh error:", error);
      return null;
    }
    
    const { session } = data;
    
    if (session) {
      // Update stored token and expiry
      localStorage.setItem("token", session.access_token);
      const expiryTime = Date.now() + (session.expires_in * 1000);
      localStorage.setItem("sessionExpiry", expiryTime.toString());
      
      if (session.refresh_token) {
        localStorage.setItem("refreshToken", session.refresh_token);
      }
      
      return session;
    }
    
    return null;
  } catch (error) {
    console.error("Restore session error:", error);
    return null;
  }
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
