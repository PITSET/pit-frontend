import { useState } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// supabase
import { supabase } from "../../lib/supabaseClient";

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onRefresh, 
  item, 
  sectionType = "section",
  deleteFunction 
}) {
  const [loading, setLoading] = useState(false);

  // Get display name from item
  const getItemName = () => {
    if (!item) return "";
    // For About and Home sections, use section_type
    // For Programs, use program_name
    return item.section_type || item.program_name || "this item";
  };

  // Delete image from Supabase storage
  const deleteImageFromStorage = async (imageUrl, type) => {
    if (!imageUrl) return;

    try {
      // Determine bucket based on section type
      let bucket = "";
      const lowerType = type?.toLowerCase() || "";
      
      if (lowerType.includes("about")) {
        bucket = "about_images";
      } else if (lowerType.includes("home")) {
        bucket = "home_images";
      } else if (lowerType.includes("program")) {
        bucket = "program_images";
      } else if (lowerType.includes("project")) {
        bucket = "project_images";
      }

      if (!bucket) return;

      // Extract file name from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      
      // Remove query params if any
      const cleanFileName = fileName.split("?")[0];

      if (cleanFileName) {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([cleanFileName]);

        if (error) {
          console.warn("Failed to delete image from storage:", error);
        }
      }
    } catch (err) {
      console.warn("Error deleting image from storage:", err);
    }
  };

  // Delete multiple images from Supabase storage
  const deleteImagesFromStorage = async (imageUrls, type) => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

    const deletePromises = imageUrls.map(imageUrl => 
      deleteImageFromStorage(imageUrl, type)
    );

    await Promise.all(deletePromises);
  };

  // Handle delete
  const handleDelete = async () => {
    const toastId = toast.loading("Deleting...");

    try {
      setLoading(true);

      if (!item?.id) {
        throw new Error("Item ID is required");
      }

      // Delete images from Supabase storage if exists
      if (sectionType.toLowerCase().includes("project") && Array.isArray(item.images)) {
        // For projects with multiple images
        await deleteImagesFromStorage(item.images, sectionType);
      } else {
        // For other sections with single image
        await deleteImageFromStorage(item.image_url, sectionType);
      }

      await deleteFunction(item.id);

      toast.success(`${sectionType} deleted successfully!`, { id: toastId });

      // auto-refresh parent data
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error("Failed to delete:", error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = `Failed to delete ${sectionType}`;
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || "Invalid request. Please check your input.";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (status === 404) {
          errorMessage = `${sectionType} not found. It may have been already deleted.`;
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal */}
      <div className="bg-[#FEF2F3] w-full max-w-[480px] max-h-[90vh] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col my-4">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-200 p-2 sm:p-3 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  Delete {sectionType}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-red-800">
                  Are you sure you want to delete this {sectionType}?
                </p>
                <p className="mt-2 text-sm text-red-600">
                  You are about to delete: <span className="font-semibold">{getItemName()}</span>
                </p>
                <p className="mt-2 text-xs text-red-500">
                  This will permanently remove this {sectionType} and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-shrink-0 bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={handleDelete}
              className="px-4 sm:px-5 py-2 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
