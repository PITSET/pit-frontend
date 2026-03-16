import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

// api
import { createContact, updateContact } from "../../lib/services/adminContactService";

export default function ContactModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;
  
  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      mapUrl: "",
    },
  });

  // Non-form state
  const [loading, setLoading] = useState(false);
  
  // Watch mapUrl for the button
  const mapUrlValue = watch("mapUrl");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          email: item.email || "",
          phone: item.phone || "",
          address: item.address || "",
          mapUrl: item.map_url || "",
        });
      } else {
        reset({
          email: "",
          phone: "",
          address: "",
          mapUrl: "",
        });
      }
    }
  }, [isOpen, item, reset]);

  // Form submission
  const onSubmit = async (data) => {
    const toastId = toast.loading(isCreate ? "Creating contact..." : "Saving...");

    try {
      setLoading(true);

      const contactData = {
        email: data.email.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        map_url: data.mapUrl.trim() || null,
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
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-200 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
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
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                })}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg outline-none text-gray-900 bg-white focus-within:ring-2 focus-within:ring-orange-400 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
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
                type="text"
                inputMode="numeric"
                {...register("phone", {
                  required: "Phone is required",
                })}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg outline-none text-gray-900 bg-white focus-within:ring-2 focus-within:ring-orange-400 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone.message}</p>
            )}
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
                {...register("address", {
                  required: "Address is required",
                })}
                rows={3}
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg outline-none text-gray-900 bg-white resize-none focus-within:ring-2 focus-within:ring-orange-400 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter company address"
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Map URL Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Map URL <span className="text-red-500">*</span>
            </label>
            
            <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <input
                type="url"
                {...register("mapUrl", {
                  required: "Map URL is required",
                })}
                placeholder="https://maps.google.com/..."
                className={`flex-1 px-3 py-2.5 text-sm shadow-sm outline-none transition min-w-0 ${errors.mapUrl ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => {
                  const urlToOpen = mapUrlValue?.startsWith('http') ? mapUrlValue : 'https://' + mapUrlValue;
                  window.open(urlToOpen, "_blank", "noopener,noreferrer");
                }}
                disabled={!mapUrlValue || errors.mapUrl}
                className="flex items-center justify-center px-3 sm:px-4 bg-primary-gradient border-l border-gray-300 text-white hover:bg-primary-gradient-hover transition disabled:opacity-50"
                title="Open Map"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-5 sm:w-5 sm:h-5" />
              </button>
            </div>
            {errors.mapUrl && (
              <p className="text-xs text-red-500">{errors.mapUrl.message}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={handleSubmit(onSubmit)}
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
