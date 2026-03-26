// frontend/src/lib/services/projectService.js

import api from "../api";

/**
 * GET all active projects (ordered by created_at descending)
 */
export const getAllProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

/**
 * GET specific project by ID
 * @param {number|string} id - Project ID
 */
export const getProjectById = async (id) => {
  const res = await api.get(`/projects/${id}`);
  return res.data;
};

/**
 * GET all projects for a program
 * @param {number|string} id - Program ID
 */
export const getProgramProjects = async (id) => {
  const res = await api.get(`/programs/${id}/projects`);
  return res.data;
};

/**
 * GET all students in a project
 * @param {number|string} id - Project ID
 */
export const getProjectStudents = async (id) => {
  const res = await api.get(`/projects/${id}/students`);
  return res.data;
};

/**
 * CREATE new project
 * @param {Object} data - Project data
 */
export const createProject = async (data) => {
  const res = await api.post("/projects", data);
  return res.data;
};

/**
 * UPDATE project
 * @param {number|string} id - Project ID
 * @param {Object} data - Updated project data
 */
export const updateProject = async (id, data) => {
  const res = await api.put(`/projects/${id}`, data);
  return res.data;
};

/**
 * DELETE project
 * @param {number|string} id - Project ID
 */
export const deleteProject = async (id) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};
