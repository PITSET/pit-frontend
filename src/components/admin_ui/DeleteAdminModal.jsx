// src/components/admin_ui/DeleteAdminModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { deleteAdmin } from "../../lib/services/adminManagementService";

export default function DeleteAdminModal({ isOpen, onClose, admin, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!admin) return;

    setLoading(true);

    try {
      await deleteAdmin(admin.id);
      toast.success("Admin deleted successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to delete admin";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal */}
      <div className="bg-[#FEF2F3] w-full max-w-[480px] max-h-[90vh] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-200 p-2 sm:p-3 rounded-xl">
                <ExclamationTriangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Delete Admin</h2>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-red-800">
                  Are you sure you want to delete this admin?
                </p>
                <p className="mt-2 text-sm text-red-600">
                  You are about to delete: <span className="font-semibold">{admin?.username}</span>
                </p>
                <p className="mt-2 text-xs text-red-500">
                  This will permanently remove this admin and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
              onClick={handleConfirm}
              className="px-4 sm:px-5 py-2 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-60"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
