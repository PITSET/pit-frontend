import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  EnvelopeIcon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// api
import { updateContact } from "../../lib/services/adminContactService";

export default function ContactModal({ isOpen, onClose, onRefresh, item }) {
  const isView = !!item;
  
  // Contact message fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("new");
  
  const [loading, setLoading] = useState(false);

  // Available status options
  const statusOptions = [
    { value: "new", label: "New", color: "bg-orange-100 text-orange-800" },
    { value: "read", label: "Read", color: "bg-blue-100 text-blue-800" },
    { value: "replied", label: "Replied", color: "bg-green-100 text-green-800" },
    { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800" },
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        setName(item.name || "");
        setEmail(item.email || "");
        setMessage(item.message || "");
        setStatus(item.status || "new");
      } else {
        // Reset for create mode (not typically used for contacts but included for consistency)
        setName("");
        setEmail("");
        setMessage("");
        setStatus("new");
      }
    }
  }, [isOpen, item]);

  // Save changes
  const handleSave = async () => {
    const toastId = toast.loading("Saving changes...");

    try {
      setLoading(true);

      const contactData = {
        name: name?.trim() || null,
        email: email?.trim() || null,
        message: message?.trim() || null,
        status: status,
      };

      // Update existing contact
      await updateContact(item.id, contactData);
      
      toast.success("Contact updated successfully!", { id: toastId });
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to update contact:", error);
      toast.error(error.response?.data?.message || "Failed to update contact", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onClose()}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <EnvelopeIcon className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isView ? "View Contact Message" : "New Contact"}
              </h2>
            </div>
            
            <button
              onClick={() => onClose()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-6">
            <div className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Enter name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900 resize-none"
                  placeholder="Enter message"
                />
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                        status === option.value
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {status === option.value && (
                        <CheckCircleIcon className="w-4 h-4" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => onClose()}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F65919] focus:ring-offset-2 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
