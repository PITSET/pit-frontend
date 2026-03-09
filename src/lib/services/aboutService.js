// frontend/src/lib/services/aboutService.js

import api from "../api";

/**
 * GET all about sections (ordered)
 */
export const getAboutSections = async () => {
  const res = await api.get("/about");
  return res.data;
};

/**
 * GET specific about section by type (history, mission, vision, etc)
 * @param {string} sectionType - The type of section (e.g., 'history', 'mission', 'vision')
 */
export const getAboutSectionByType = async (sectionType) => {
  const res = await api.get(`/about/${sectionType}`);
  return res.data;
};

/**
 * CREATE new about section
 * @param {Object} data - About section data
 */
export const createAboutSection = async (data) => {
  const res = await api.post("/about", data);
  return res.data;
};

/**
 * UPDATE about section
 * @param {number|string} id - Section ID
 * @param {Object} data - Updated section data
 */
export const updateAboutSection = async (id, data) => {
  const res = await api.put(`/about/${id}`, data);
  return res.data;
};

/**
 * DELETE about section
 * @param {number|string} id - Section ID
 */
export const deleteAboutSection = async (id) => {
  const res = await api.delete(`/about/${id}`);
  return res.data;
};

/**
 * UPDATE section order position
 * @param {number|string} id - Section ID
 * @param {number} order - New order position
 */
export const reorderAboutSection = async (id, order) => {
  const res = await api.put(`/about/${id}/reorder`, { order });
  return res.data;
};
