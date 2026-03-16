import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  AcademicCapIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

// api
import { createProgram, updateProgram } from "../../lib/services/programService";
import { supabase } from "../../lib/supabaseClient";
import { getOperationErrorMessage } from "../../lib/httpErrorHandler";

export default function ProgramModal({ isOpen, onClose, onRefresh, item }) {
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
      programName: "",
      description: "",
      overview: "",
      isActive: true,
    },
  });

  // Watch isActive for toggle display
  const watchIsActive = watch("isActive");

  // Non-form state
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  // Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // limit file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    setImage(file);
    toast.success("Image selected");
  };

  // Convert image to WEBP (compression + resize)
  const convertToWebp = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const maxWidth = 1600;
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/webp",
          0.8,
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          programName: item.program_name || "",
          description: item.description || "",
          overview: item.overview || "",
          isActive: item.is_active ?? true,
        });
        setImage(null);
      } else {
        reset({
          programName: "",
          description: "",
          overview: "",
          isActive: true,
        });
        setImage(null);
      }
    }
  }, [isOpen, item, reset]);

  // Form submission
  const onSubmit = async (data) => {
    const toastId = toast.loading(isCreate ? "Creating program..." : "Saving changes...");

    try {
      setLoading(true);

      let imageUrl = item?.image_url || "";

      // Delete old image if a new image is being uploaded
      if (image && item?.image_url) {
        try {
          const urlParts = item.image_url.split("/");
          const fileName = urlParts[urlParts.length - 1].split("?")[0];
          if (fileName) {
            await supabase.storage.from("program_images").remove([fileName]);
          }
        } catch (err) {
          console.warn("Failed to delete old image:", err);
        }
      }

      if (image) {
        const safeProgram = (data.programName || "new-program")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `program-${safeProgram}-${Date.now()}.webp`;

        toast.loading("Compressing & uploading image...", { id: toastId });

        const webpImage = await convertToWebp(image);

        const { error: uploadError } = await supabase.storage
          .from("program_images")
          .upload(fileName, webpImage, {
            upsert: true,
            cacheControl: "3600",
            contentType: "image/webp",
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: uploadData } = supabase.storage
          .from("program_images")
          .getPublicUrl(fileName);

        // prevent browser cache
        imageUrl = `${uploadData.publicUrl}?t=${Date.now()}`;
      }

      const programData = {
        program_name: data.programName,
        description: data.description,
        overview: data.overview,
        image_url: imageUrl,
        is_active: data.isActive,
      };

      if (isCreate) {
        await createProgram(programData);
        toast.success("Program created successfully!", { id: toastId });
      } else {
        await updateProgram(item.id, programData);
        toast.success("Program updated successfully!", { id: toastId });
      }

      // auto-refresh parent data
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      
      // Use the improved error handler to get backend message with fallback
      const errorMessage = getOperationErrorMessage(
        error,
        isCreate ? 'create' : 'update',
        'program'
      );
      
      toast.error(errorMessage, { id: toastId });
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
        <div className="flex-shrink-0 bg-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-200 p-2 sm:p-3 rounded-xl">
                <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isCreate ? "Create Program" : `Update Program (${item?.program_name})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new program" : "Edit your program information"}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Program Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Program Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              {...register("programName", {
                required: "Program name is required",
              })}
              placeholder="Enter program name..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            {errors.programName && (
              <p className="text-xs text-red-500">{errors.programName.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center gap-3 py-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="sr-only peer"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  watchIsActive ? "bg-green-500" : "bg-gray-300"
                }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      watchIsActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </div>
              </label>
              <span className={`text-sm font-medium ${watchIsActive ? "text-green-600" : "text-gray-500"}`}>
                {watchIsActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {/* Left: Image Upload */}
            <div className="flex flex-col gap-3">
              {/* Image Upload */}
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-gray-700">Image</span>
              </div>
              <label className="relative group block rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm cursor-pointer">
                <img
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : item?.image_url || "/placeholder.svg"
                  }
                  alt="Preview"
                  className="w-full h-[160px] sm:h-[180px] md:h-[220px] object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary-gradient rounded-full p-2 sm:p-3 mb-1 sm:mb-2 shadow">
                    <ArrowUpTrayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-white">
                    Upload Photo
                  </p>

                  <p className="text-xs text-white/80 hidden sm:block">
                    JPG, PNG up to 10MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Right: Description */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                {...register("description")}
                placeholder="Enter description..."
                className="flex-1 w-full min-h-[160px] sm:min-h-[200px] md:min-h-[250px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
              />
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Overview
            </label>

            <textarea
              {...register("overview")}
              placeholder="Enter overview..."
              className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-5 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F65919] focus:ring-offset-2 transition disabled:opacity-60"
              >
                {loading ? (isCreate ? "Creating..." : "Saving...") : (isCreate ? "Create" : "Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
