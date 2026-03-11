import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  InformationCircleIcon,
  ArrowUpTrayIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// api
import { createProgram, updateProgram } from "../../lib/services/programService";
import { supabase } from "../../lib/supabaseClient";

export default function ProgramModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;
  const [programName, setProgramName] = useState("");
  const [description, setDescription] = useState("");
  const [overview, setOverview] = useState("");
  const [image, setImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Close dropdown when clicking outside
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        // Close any dropdowns if needed
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Save changes
  const handleSave = async () => {
    const toastId = toast.loading(isCreate ? "Creating program..." : "Saving changes...");

    try {
      setLoading(true);

      let imageUrl = item?.image_url || "";

      if (image) {
        const safeProgramName = (item?.program_name || "new-program")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `program-${safeProgramName}-${Date.now()}.webp`;

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

        const { data } = supabase.storage
          .from("program_images")
          .getPublicUrl(fileName);

        // prevent browser cache
        imageUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const programData = {
        program_name: programName,
        description,
        overview,
        image_url: imageUrl,
        video_url: videoUrl,
        is_active: isActive,
      };

      if (isCreate) {
        // Validate required fields
        if (!programName || !programName.trim()) {
          toast.error("Program name is required", { id: toastId });
          setLoading(false);
          return;
        }

        // Create new program
        await createProgram(programData);

        toast.success("Program created successfully!");
      } else {
        // Update existing program
        await updateProgram(item.id, programData);

        toast.success("Program updated successfully!");
      }

      // auto-refresh parent data
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error(isCreate ? "Failed to create program" : "Failed to update program", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setProgramName(item?.program_name || "");
    setDescription(item?.description || "");
    setOverview(item?.overview || "");
    setImage(null);
    setVideoUrl(item?.video_url || "");
    setIsActive(item?.is_active ?? true);
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        resetForm();
      } else {
        // Reset form for create mode
        setProgramName("");
        setDescription("");
        setOverview("");
        setImage(null);
        setVideoUrl("");
        setIsActive(true);
      }
    }
  }, [isOpen, item]);

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
                <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isCreate ? "Create Program" : `Update Program (${item.program_name})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new program" : "Edit your program information"}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Program Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Program Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              value={programName}
              placeholder="Enter program name..."
              onChange={(e) => setProgramName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>

            <textarea
              value={description}
              placeholder="Enter description..."
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
            />
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Overview</label>

            <textarea
              value={overview}
              placeholder="Enter overview..."
              onChange={(e) => setOverview(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Video URL</label>

            <input
              type="url"
              value={videoUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Program Image</label>

            <div className="flex items-center gap-4">
              {/* Current Image Preview */}
              {(image || item?.image_url) && (
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={image ? URL.createObjectURL(image) : item?.image_url}
                    alt="Program preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              {/* Upload Button */}
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <ArrowUpTrayIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {image ? "Change Image" : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {image && (
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition ${
                  isActive
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <CheckIcon className={`w-4 h-4 ${isActive ? "text-green-500" : "text-gray-400"}`} />
                <span className="text-sm font-medium">Active</span>
              </button>

              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition ${
                  !isActive
                    ? "bg-gray-50 border-gray-400 text-gray-700"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <span className="text-sm font-medium">Inactive</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 bg-white rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : isCreate ? "Create Program" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
