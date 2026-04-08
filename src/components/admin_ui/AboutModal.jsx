import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  InformationCircleIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// api
import { createAboutSection, updateAboutSection } from "../../lib/services/aboutService";
import { uploadFile, deleteFile } from "../../lib/services/storageService";
import { getOperationErrorMessage } from "../../lib/httpErrorHandler";

export default function AboutModal({ isOpen, onClose, onRefresh, item, existingSectionTypes = [], existingOrderPositions = [] }) {
  const isCreate = !item;

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      sectionType: "",
      customSectionType: "",
      orderPosition: 1,
      isActive: true,
    },
  });

  // Watch fields
  const watchIsActive = watch("isActive");
  const watchOrderPosition = watch("orderPosition");
  const watchSectionType = watch("sectionType");
  const watchCustomSectionType = watch("customSectionType");

  // State for non-form data
  const [loading, setLoading] = useState(false);
  const [showSectionTypeDropdown, setShowSectionTypeDropdown] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [image, setImage] = useState(null);

  // Refs for dropdowns
  const sectionTypeDropdownRef = useRef(null);
  const positionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sectionTypeDropdownRef.current &&
        !sectionTypeDropdownRef.current.contains(event.target)
      ) {
        setShowSectionTypeDropdown(false);
      }
      if (
        positionDropdownRef.current &&
        !positionDropdownRef.current.contains(event.target)
      ) {
        setShowPositionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get the actual section type to use
  const getSectionTypeValue = () => {
    // For create mode: use customSectionType
    // For update mode: use sectionType (existing value)
    return isCreate ? watchCustomSectionType : watchSectionType;
  };

  // Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith('.heic')) {
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
      // Skip conversion for SVG and GIF to preserve formatting/animation
      if (file.type === "image/svg+xml" || file.type === "image/gif") {
        resolve(file);
        return;
      }

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
            resolve(new File([blob], file.name ? file.name.replace(/\.[^/.]+$/, "") + ".webp" : "image.webp", { type: "image/webp" }));
          },
          "image/webp",
          0.8,
        );
      };

      img.onerror = () => {
        resolve(file); // fallback to original file on error
      };

      reader.readAsDataURL(file);
    });
  };

  // Save changes
  const onSubmit = async (data) => {
    const toastId = toast.loading(isCreate ? "Creating section..." : "Saving changes...");

    try {
      setLoading(true);

      let imageUrl = item?.image_url || "";

      // Delete old image if a new image is being uploaded
      if (image && item?.image_url) {
        try {
          const urlParts = item.image_url.split("/");
          const fileName = urlParts[urlParts.length - 1].split("?")[0];
          if (fileName) {
            await deleteFile(fileName, "about_images");
          }
        } catch (err) {
          console.warn("Failed to delete old image:", err);
        }
      }

      if (image) {
        const safeSection = (item?.section_type || "new-section")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const webpImage = await convertToWebp(image);
        toast.loading("Compressing & uploading image...", { id: toastId });

        // Use the storage service instead of direct supabase calls
        const uploadResult = await uploadFile(webpImage, "about_images");
        
        // prevent browser cache
        imageUrl = `${uploadResult.publicUrl}?t=${Date.now()}`;
      }

      const sectionData = {
        title: data.title,
        content: data.content,
        image_url: imageUrl,
        section_type: isCreate ? getSectionTypeValue() : watchSectionType,
        order_position: data.orderPosition,
        is_active: data.isActive,
      };

      if (isCreate) {
        // Validate required fields
        const sectionTypeValue = getSectionTypeValue();
        if (!sectionTypeValue || !sectionTypeValue.trim()) {
          toast.error("Section type is required", { id: toastId });
          setLoading(false);
          return;
        }

        if (!data.title || !data.title.trim()) {
          toast.error("Title is required", { id: toastId });
          setLoading(false);
          return;
        }

        // Check if section type already exists
        const existingTypesLower = existingSectionTypes.map((t) => {
          const typeName = typeof t === 'string' ? t : (t?.type || '');
          return typeName.toLowerCase();
        });
        if (existingTypesLower.includes(sectionTypeValue.trim().toLowerCase())) {
          toast.error(`Section type "${sectionTypeValue}" already exists. Please use a different name.`, { id: toastId });
          setLoading(false);
          return;
        }

        // Use the section type as-is
        sectionData.section_type = sectionTypeValue.trim();

        // Use the selected position directly
        sectionData.order_position = data.orderPosition;

        // Create new section
        await createAboutSection(sectionData);

        toast.success("Section created successfully!", { id: toastId });
      } else {
        // Update existing section - check if section type changed
        const newSectionType = watchSectionType;
        const originalSectionType = item.section_type;

        // Only validate if the section type has changed
        if (newSectionType.trim().toLowerCase() !== originalSectionType.trim().toLowerCase()) {
          const existingTypesLower = existingSectionTypes.map((t) => {
            const typeName = typeof t === 'string' ? t : t.type;
            return typeName.toLowerCase();
          });
          if (existingTypesLower.includes(newSectionType.trim().toLowerCase())) {
            toast.error(`Section type "${newSectionType}" already exists. Please use a different name.`, { id: toastId });
            setLoading(false);
            return;
          }
        }

        // Check if only position changed - use updateAboutSection with just order_position
        const onlyPositionChanged =
          data.title === item.title &&
          data.content === item.content &&
          image === null &&
          watchSectionType === item.section_type &&
          data.isActive === item.is_active &&
          data.orderPosition !== item.order_position;

        if (onlyPositionChanged) {
          // Use update endpoint with only order_position for position-only changes
          await updateAboutSection(item.id, { order_position: data.orderPosition });
          toast.success("Section position updated successfully!", { id: toastId });
        } else {
          // Use general update endpoint for other changes
          await updateAboutSection(item.id, sectionData);
          toast.success("Section updated successfully!", { id: toastId });
        }
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
        'section'
      );

      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    if (item) {
      reset({
        title: item?.title || "",
        content: item?.content || "",
        sectionType: item?.section_type || "",
        customSectionType: item?.section_type || "",
        orderPosition: item?.order_position || 1,
        isActive: item?.is_active ?? true,
      });
    } else {
      // Auto-select smallest unused position for create mode
      const maxPosition = Math.max(10, ...(existingOrderPositions?.filter(p => typeof p === 'number') || [])) + 2;
      const usedPositions = new Set(existingOrderPositions || []);
      let smallestUnused = 1;
      while (usedPositions.has(smallestUnused) && smallestUnused <= maxPosition) {
        smallestUnused++;
      }

      reset({
        title: "",
        content: "",
        sectionType: "",
        customSectionType: "",
        orderPosition: smallestUnused,
        isActive: true,
      });
    }
    setImage(null);
    setShowSectionTypeDropdown(false);
    setShowPositionDropdown(false);
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal */}
      <div className="bg-[#FEF2F3] w-full max-w-[720px] max-h-[90vh] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col my-4">
        {/* Header - Fixed */}
        <div className="shrink-0 bg-white rounded-t-2xl px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-200 p-2 sm:p-3 rounded-xl">
                <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isCreate ? "Create About Section" : `Update About (${item?.section_type})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new about section" : "Edit your about information"}
                </p>
              </div>
            </div>

            <button
              type="button"
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
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                {...register("title", { required: "Title is required" })}
                placeholder="Enter title..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Section Type */}
            <div className="space-y-2" ref={sectionTypeDropdownRef}>
              <label className="text-sm font-medium text-gray-700">
                Section Type <span className="text-red-500">*</span>
              </label>

              {/* Input field with dropdown button */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
                <input
                  type="text"
                  {...register("customSectionType")}
                  placeholder="e.g., history, mission, vision"
                  onChange={(e) => {
                    setValue("customSectionType", e.target.value);
                    setValue("sectionType", e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    }
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm outline-none transition min-w-0"
                  disabled={!isCreate}
                />
                {existingSectionTypes.length > 0 && isCreate && (
                  <button
                    type="button"
                    onClick={() => setShowSectionTypeDropdown(!showSectionTypeDropdown)}
                    className="flex items-center justify-center px-3 sm:px-4 bg-gray-50 border-l border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                    title="Select existing"
                  >
                    <ChevronDownIcon className="w-4 h-5 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              {/* Dropdown for existing section types (read-only - for reference only) */}
              {showSectionTypeDropdown && existingSectionTypes.length > 0 && isCreate && (
                <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-sm max-h-40 overflow-y-auto">
                  {existingSectionTypes.map((item, index) => {
                    const type = typeof item === 'string' ? item : (item?.type || '');
                    const isActive = typeof item === 'object' ? item?.isActive : true;
                    const isCurrentSectionType = watchSectionType && type.toLowerCase() === watchSectionType?.toLowerCase();
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          if (isCurrentSectionType) {
                            setShowSectionTypeDropdown(false);
                          }
                        }}
                        className={`w-full px-3 sm:px-4 py-2 text-left text-sm transition flex items-center justify-between ${isCurrentSectionType
                          ? "bg-orange-50 text-orange-600 cursor-pointer"
                          : isActive
                            ? "text-gray-700 bg-white hover:bg-gray-100 cursor-not-allowed"
                            : "text-gray-400 bg-gray-50 cursor-not-allowed"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{type}</span>
                          {isCurrentSectionType && (
                            <span className="text-xs font-medium text-orange-500">(Current)</span>
                          )}
                          {!isCurrentSectionType && (
                            <span className={`text-xs ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                              ({isActive ? 'Active' : 'Inactive'})
                            </span>
                          )}
                        </div>
                        {isCurrentSectionType && (
                          <CheckIcon className="w-4 h-4 text-orange-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Position & Active Status */}
            <div className="grid grid-cols-2 gap-4">
              {/* Order Position */}
              <div className="space-y-2" ref={positionDropdownRef}>
                <label className="text-sm font-medium text-gray-700">Order Position <span className="text-red-500">*</span></label>

                {/* Custom dropdown for position */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPositionDropdown(!showPositionDropdown)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  >
                    <span className={existingOrderPositions.includes(watchOrderPosition) && (!item || item.order_position !== watchOrderPosition) ? "text-gray-700" : ""}>
                      {watchOrderPosition}
                      {item && item.order_position === watchOrderPosition && (
                        <span className="ml-2 text-xs text-orange-500">(Current)</span>
                      )}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* Position dropdown */}
                  {showPositionDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-sm max-h-48 overflow-y-auto">
                      {Array.from({ length: Math.max(10, ...(existingOrderPositions?.filter(p => typeof p === 'number') || [])) + 2 }, (_, i) => i + 1).map((pos) => {
                        const isUsed = existingOrderPositions.includes(pos);
                        const isCurrent = item && item.order_position === pos;
                        const isDisabled = isUsed && !isCurrent;

                        return (
                          <button
                            key={pos}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!isDisabled) {
                                setValue("orderPosition", pos);
                                setShowPositionDropdown(false);
                              }
                            }}
                            className={`w-full px-3 py-2 text-left text-sm transition flex items-center justify-between ${isCurrent
                              ? "bg-orange-50 text-orange-600 cursor-pointer"
                              : isDisabled
                                ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                                : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                              }`}
                          >
                            <span>{pos}</span>
                            <div className="flex items-center gap-1">
                              {isCurrent && (
                                <span className="text-xs font-medium text-orange-500">(Current)</span>
                              )}
                              {isDisabled && (
                                <span className="text-xs text-gray-400">(Used)</span>
                              )}
                              {isCurrent && <CheckIcon className="w-3 h-3 text-orange-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Status */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => setValue("isActive", !watchIsActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${watchIsActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${watchIsActive ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                  <span className={`text-sm font-medium ${watchIsActive ? "text-green-600" : "text-gray-500"}`}>
                    {watchIsActive ? "Active" : "Inactive"}
                  </span>
                </div>
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
                <label className="relative group block rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm cursor-pointer" onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { handleImageChange({ target: { files: e.dataTransfer.files } }); } }}>
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
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.heic"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Right: Description */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>

                <textarea
                  {...register("content", { required: "Description is required" })}
                  placeholder="Enter description..."
                  className="flex-1 w-full min-h-[160px] sm:min-h-[200px] md:min-h-[250px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
                />
                {errors.content && (
                  <p className="text-xs text-red-500">{errors.content.message}</p>
                )}
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="shrink-0 bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 mt-6">
              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
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
    </div>
  );
}
