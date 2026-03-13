// frontend/src/lib/services/studentService.js

import api from "../api";

/**
 * GET all students
 */
export const getAllStudents = async () => {
  const res = await api.get("/students");
  return res.data;
};

/**
 * GET specific student by ID
 * @param {number|string} id - Student ID
 */
export const getStudentById = async (id) => {
  const res = await api.get(`/students/${id}`);
  return res.data;
};

/**
 * UPDATE student
 * @param {number|string} id - Student ID
 * @param {Object} data - Updated student data
 */
export const updateStudent = async (id, data) => {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
};

/**
 * DELETE student
 * @param {number|string} id - Student ID
 */
export const deleteStudent = async (id) => {
  const res = await api.delete(`/students/${id}`);
  return res.data;
};
