import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// api
import { createContact, updateContact } from "../../lib/services/adminContactService";

export default function ContactModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;
  
  // Contact info fields (matching backend: email, phone, address, map_url)
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Validate email format
  const validateEmail = (emailValue) => {
    if (!emailValue || !emailValue.trim()) {
      return { valid: true, message: "" };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return { valid: false, message: "Please enter a valid email address" };
    }
    
    return { valid: true, message: "" };
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        setEmail(item.email || "");
        setPhone(item.phone || "");
        setAddress(item.address || "");
        setMapUrl(item.map_url || "");
        setEmailError("");
      } else {
        // Reset for create mode
        setEmail("");
        setPhone("");
        setAddress("");
        setMapUrl("");
        setEmailError("");
      }
    }
  }, [isOpen, item]);

  // Validate form
  const validateForm = () => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return false;
    }
    if (!phone.trim()) {
      toast.error("Phone is required");
      return false;
    }
    if (!address.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (!mapUrl.trim()) {
      toast.error("Map URL is required");
      return false;
    }
  };

  // Reset form helper
  const resetForm = () => {
    setEmail(item?.email || "");
    setPhone(item?.phone || "");
    setAddress(item?.address || "");
    setMapUrl(item?.map_url || "");
    setEmailError("");
  };

  // Save changes
  const handleSave = async () => {
    if (!validateForm()) return;

    const toastId = toast.loading(isCreate ? "Creating contact..." : "Saving...");

    try {
      setLoading(true);

      const contactData = {
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        map_url: mapUrl.trim() || null,
      };

      if (isCreate) {
        await createContact(contactData);
        toast.success("Contact created successfully!", { id: toastId });
      } else {
        await updateContact(item.id, contactData);
        toast.success("Contact updated successfully!", { id: toastId });
      }
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Failed to save contact:", error);
      toast.error(error.response?.data?.message || "Failed to save contact", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal */}
      <div className="bg-[#FEF2F3] w-full max-w-[720px] max-h-[90vh] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col my-4">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-200 p-2 sm:p-3 rounded-xl">
                <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isCreate ? "Create Contact" : `Update Contact`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add new contact information" : "Edit contact information"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  // Validate email format
                  if (value) {
                    const validation = validateEmail(value);
                    setEmailError(validation.message);
                  } else {
                    setEmailError("");
                  }
                }}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-orange-500 text-gray-900 bg-white ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter email address"
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500">{emailError}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white resize-none"
                placeholder="Enter company address"
              />
            </div>
          </div>

          {/* Map URL Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Map URL <span className="text-red-500">*</span>
            </label>
            
            <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="flex-1 px-3 py-2.5 text-sm shadow-sm outline-none transition min-w-0"
              />
              <button
                type="button"
                onClick={() => {
                  const urlToOpen = mapUrl.startsWith('http') ? mapUrl : 'https://' + mapUrl;
                  window.open(urlToOpen, "_blank", "noopener,noreferrer");
                }}
                disabled={!mapUrl}
                className="flex items-center justify-center px-3 sm:px-4 bg-primary-gradient border-l border-gray-300 text-white hover:bg-primary-gradient-hover transition disabled:opacity-50"
                title="Open Map"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-5 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F65919] focus:ring-offset-2 transition disabled:opacity-60"
            >
              {loading ? (isCreate ? "Creating..." : "Saving...") : (isCreate ? "Create" : "Save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
