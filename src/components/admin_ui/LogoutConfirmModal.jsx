import { useState } from "react";

// heroicons
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  // Handle logout confirmation
  const handleLogout = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
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
                <ArrowRightOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Confirm Logout
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  You are about to sign out of your account
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-200 transition"
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
                  Are you sure you want to log out?
                </p>
                <p className="mt-2 text-sm text-red-600">
                  You will need to sign in again to access the admin panel.
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
              onClick={handleLogout}
              className="px-4 sm:px-5 py-2 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging out...</span>
                </>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
