// src/components/admin_ui/ResendInviteModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import {
  XMarkIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { resendInvite } from "../../lib/services/adminManagementService";

export default function ResendInviteModal({ isOpen, onClose, admin, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!admin) return;

    setLoading(true);

    try {
      await resendInvite(admin.id);
      toast.success(`Invitation resent to ${admin.email}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Failed to resend invitation";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <EnvelopeIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Resend Invitation
                </h2>
                <p className="text-xs text-white/70">
                  Send new invitation link
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">
                  Resend invitation to this admin?
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  A new invitation link will be sent to <span className="font-semibold">{admin?.email}</span>
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  The previous invitation link will become invalid.
                </p>
              </div>
            </div>
          </div>
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
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <EnvelopeIcon className="w-4 h-4" />
                Resend Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
