// frontend/src/lib/services/programService.js

import api from "../api";

/**
 * GET all active programs (ordered by created_at descending)
 */
export const getAllPrograms = async () => {
  const res = await api.get("/programs");
  return res.data;
};

/**
 * GET specific program by ID
 * @param {number|string} id - Program ID
 */
export const getProgramById = async (id) => {
  const res = await api.get(`/programs/${id}`);
  return res.data;
};

/**
 * GET all instructors for a program
 * @param {number|string} id - Program ID
 */
export const getProgramInstructors = async (id) => {
  const res = await api.get(`/programs/${id}/instructors`);
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
 * GET all students in a program
 * @param {number|string} id - Program ID
 */
export const getProgramStudents = async (id) => {
  const res = await api.get(`/programs/${id}/students`);
  return res.data;
};

/**
 * DELETE instructor from a program
 * @param {number|string} programId - Program ID
 * @param {number|string} instructorId - Instructor ID
 */
export const deleteProgramInstructor = async (programId, instructorId) => {
  const res = await api.delete(`/programs/${programId}/instructors/${instructorId}`);
  return res.data;
};

/**
 * DELETE project from a program
 * @param {number|string} programId - Program ID
 * @param {number|string} projectId - Project ID
 */
export const deleteProgramProject = async (programId, projectId) => {
  const res = await api.delete(`/programs/${programId}/projects/${projectId}`);
  return res.data;
};

/**
 * DELETE student from a program
 * @param {number|string} programId - Program ID
 * @param {number|string} studentId - Student ID
 */
export const deleteProgramStudent = async (programId, studentId) => {
  const res = await api.delete(`/programs/${programId}/students/${studentId}`);
  return res.data;
};

/**
 * Update student
 * @param {number|string} id - Student ID
 * @param {Object} data - Student data
 */
export const updateStudent = async (id, data) => {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
};

/**
 * CREATE new program
 * @param {Object} data - Program data (program_name, description, image_url, video_url, overview)
 */
export const createProgram = async (data) => {
  const res = await api.post("/programs", data);
  return res.data;
};

/**
 * UPDATE program
 * @param {number|string} id - Program ID
 * @param {Object} data - Updated program data
 */
export const updateProgram = async (id, data) => {
  const res = await api.put(`/programs/${id}`, data);
  return res.data;
};

/**
 * DELETE program
 * @param {number|string} id - Program ID
 */
export const deleteProgram = async (id) => {
  const res = await api.delete(`/programs/${id}`);
  return res.data;
};
