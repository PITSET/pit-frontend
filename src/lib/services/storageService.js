// src/lib/services/storageService.js
import api from "../api";

/**
 * Upload file to Supabase Storage via backend API
 * @param {File} file - The file to upload
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<{fileName: string, publicUrl: string}>}
 */
export const uploadFile = async (file, bucket) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);

  const response = await api.post("/storage/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to upload file");
  }

  return response.data.data;
};

/**
 * Delete file from Supabase Storage via backend API
 * @param {string} fileName - The file name to delete
 * @param {string} bucket - The storage bucket name
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileName, bucket) => {
  const response = await api.post("/storage/delete", {
    fileName,
    bucket,
  });

  if (!response.data.success) {
    throw new Error(response.data.error || "Failed to delete file");
  }

  return response.data;
};
