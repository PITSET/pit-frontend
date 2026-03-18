// src/components/admin_ui/ConfirmStatusModal.jsx
import { useState } from "react";
import {
  XMarkIcon,
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
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error is handled by the service with toast notifications
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className={`relative px-6 py-5 ${isEnabling ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-yellow-500"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                {isEnabling ? (
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                ) : (
                  <ShieldExclamationIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isEnabling ? "Enable Admin" : "Disable Admin"}
                </h2>
                <p className="text-xs text-white/70">
                  {isEnabling ? "Allow admin access" : "Revoke admin access"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isEnabling ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    Enable this admin account?
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    <span className="font-semibold">{admin?.username}</span> will regain access to the admin panel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldExclamationIcon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">
                    Disable this admin account?
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    <span className="font-semibold">{admin?.username}</span> will lose access to the admin panel.
                  </p>
                  <p className="text-xs text-orange-600 mt-2">
                    You can re-enable this admin at any time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isEnabling
                ? "bg-green-600 hover:bg-green-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : isEnabling ? (
              <>
                <ShieldCheckIcon className="w-4 h-4" />
                Enable
              </>
            ) : (
              <>
                <ShieldExclamationIcon className="w-4 h-4" />
                Disable
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
