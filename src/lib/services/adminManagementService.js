// src/lib/services/adminManagementService.js
import api from "../api";

/**
 * Get all admins (super_admin only)
 */
export const getAllAdmins = async () => {
  try {
    const response = await api.get("/admin-management/admins");
    return response.data;
  } catch (error) {
    console.error("Get all admins error:", error);
    throw error;
  }
};

/**
 * Get admin by ID
 */
export const getAdminById = async (id) => {
  try {
    const response = await api.get(`/admin-management/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get admin by ID error:", error);
    throw error;
  }
};

/**
 * Invite new admin
 * @param {Object} adminData - { email, username, role }
 */
export const inviteAdmin = async (adminData) => {
  try {
    const response = await api.post("/admin-management/admins/invite", adminData);
    return response.data;
  } catch (error) {
    console.error("Invite admin error:", error);
    throw error;
  }
};

/**
 * Update admin (username, role)
 * @param {string} id - Admin ID
 * @param {Object} adminData - { username, role }
 */
export const updateAdmin = async (id, adminData) => {
  try {
    const response = await api.put(`/admin-management/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    console.error("Update admin error:", error);
    throw error;
  }
};

/**
 * Toggle admin status (enable/disable)
 * @param {string} id - Admin ID
 * @param {boolean} is_active - true to enable, false to disable
 */
export const toggleAdminStatus = async (id, is_active) => {
  try {
    const response = await api.patch(`/admin-management/admins/${id}/toggle-status`, { is_active });
    return response.data;
  } catch (error) {
    console.error("Toggle admin status error:", error);
    throw error;
  }
};

/**
 * Delete admin (permanent)
 * @param {string} id - Admin ID
 */
export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/admin-management/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete admin error:", error);
    throw error;
  }
};
