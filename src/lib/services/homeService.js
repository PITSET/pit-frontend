// frontend/src/lib/services/homeService.js

import api from "../api";

/**
 * GET all home sections
 */
export const getHomeSections = async () => {
  const res = await api.get("/home");
  return res.data;
};

/**
 * UPDATE home section
 * We send JSON instead of FormData
 */
export const updateHomeSection = async (id, data) => {
  const res = await api.put(`/home/${id}`, data);
  return res.data;
};

/**
 * DELETE home section
 */
export const deleteHomeSection = async (id) => {
  const res = await api.delete(`/home/${id}`);
  return res.data;
};
