// frontend/src/lib/services/memberService.js

import api from "../api";

/**
 * GET all members
 */
export const getAllMembers = async () => {
  const res = await api.get("/team-members");
  return res.data;
};

/**
 * GET specific member by ID
 * @param {number|string} id - Member ID
 */
export const getMemberById = async (id) => {
  const res = await api.get(`/team-members/${id}`);
  return res.data;
};

/**
 * CREATE new member
 * @param {Object} data - Member data
 */
export const createMember = async (data) => {
  const res = await api.post("/team-members", data);
  return res.data;
};

/**
 * UPDATE member
 * @param {number|string} id - Member ID
 * @param {Object} data - Updated member data
 */
export const updateMember = async (id, data) => {
  const res = await api.put(`/team-members/${id}`, data);
  return res.data;
};

/**
 * DELETE member
 * @param {number|string} id - Member ID
 */
export const deleteMember = async (id) => {
  const res = await api.delete(`/team-members/${id}`);
  return res.data;
};
