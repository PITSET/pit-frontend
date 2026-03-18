// src/components/admin_ui/ConfirmStatusModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { toggleAdminStatus } from "../../lib/services/adminManagementService";

export default function ConfirmStatusModal({ isOpen, onClose, admin, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const isEnabling = admin?.is_active === false;

  const handleConfirm = async () => {
    if (!admin) return;

    setLoading(true);

    try {
      await toggleAdminStatus(admin.id, isEnabling);
      toast.success(isEnabling ? "Admin enabled successfully" : "Admin disabled successfully");
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to update status";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal */}
      <div className="bg-white w-full max-w-[480px] max-h-[90vh] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col my-4">
        {/* Header */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-2 sm:p-3 rounded-xl ${isEnabling ? "bg-green-200" : "bg-yellow-200"}`}>
                {isEnabling ? (
                  <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                ) : (
                  <ShieldExclamationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isEnabling ? "Enable Admin" : "Disable Admin"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  {isEnabling ? "Allow admin access" : "Revoke admin access"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isEnabling ? (
            /* Enable message */
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-green-800">
                    Enable this admin account?
                  </p>
                  <p className="mt-2 text-sm text-green-600">
                    <span className="font-semibold">{admin?.username}</span> will regain access to the admin panel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Disable message */
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-yellow-800">
                    Disable this admin account?
                  </p>
                  <p className="mt-2 text-sm text-yellow-600">
                    <span className="font-semibold">{admin?.username}</span> will lose access to the admin panel.
                  </p>
                  <p className="mt-2 text-xs text-yellow-500">
                    You can re-enable this admin at any time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
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
              className={`px-4 sm:px-5 py-2 rounded-lg text-white font-medium active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-60 ${
                isEnabling
                  ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                  : "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500"
              }`}
            >
              {loading ? "Processing..." : isEnabling ? "Enable" : "Disable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
