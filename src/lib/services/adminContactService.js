// frontend/src/lib/services/adminContactService.js

import api from "../api";

/**
 * POST create a new contact (used by the public contact form)
 * @param {Object} data - Contact data { email, phone, address }
 */
export const createContact = async (data) => {
  const res = await api.post("/admin/contacts", data);
  return res.data;
};

/**
 * GET all contacts (for admin)
 */
export const getAllContacts = async () => {
  const res = await api.get("/admin/contacts");
  return res.data;
};

/**
 * GET single contact by ID
 * @param {number|string} id - Contact ID
 */
export const getContactById = async (id) => {
  const res = await api.get(`/admin/contacts/${id}`);
  return res.data;
};

/**
 * PUT update contact by ID
 * @param {number|string} id - Contact ID
 * @param {Object} data - Updated contact data { email, phone, address }
 */
export const updateContact = async (id, data) => {
  const res = await api.put(`/admin/contacts/${id}`, data);
  return res.data;
};

/**
 * DELETE contact by ID
 * @param {number|string} id - Contact ID
 */
export const deleteContact = async (id) => {
  const res = await api.delete(`/admin/contacts/${id}`);
  return res.data;
};
