import { useState, useEffect, useRef } from "react";
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
import { supabase } from "../../lib/supabaseClient";

export default function AboutModal({ isOpen, onClose, onRefresh, item, existingSectionTypes = [], existingOrderPositions = [] }) {
  const isCreate = !item;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sectionType, setSectionType] = useState("");
  const [customSectionType, setCustomSectionType] = useState("");
  const [showSectionTypeDropdown, setShowSectionTypeDropdown] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [orderPosition, setOrderPosition] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Close dropdown when clicking outside
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
    return isCreate ? customSectionType : sectionType;
  };

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
    const toastId = toast.loading(isCreate ? "Creating section..." : "Saving changes...");

    try {
      setLoading(true);

      let imageUrl = item?.image_url || "";

      if (image) {
        const safeSection = (item?.section_type || "new-section")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `about-${safeSection}-${Date.now()}.webp`;

        toast.loading("Compressing & uploading image...", { id: toastId });

        const webpImage = await convertToWebp(image);

        const { error: uploadError } = await supabase.storage
          .from("about_images")
          .upload(fileName, webpImage, {
            upsert: true,
            cacheControl: "3600",
            contentType: "image/webp",
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("about_images")
          .getPublicUrl(fileName);

        // prevent browser cache
        imageUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const sectionData = {
        title,
        content,
        image_url: imageUrl,
        section_type: isCreate ? getSectionTypeValue() : sectionType,
        order_position: orderPosition,
        is_active: isActive,
      };

      if (isCreate) {
        // Validate required fields
        const sectionTypeValue = getSectionTypeValue();
        if (!sectionTypeValue || !sectionTypeValue.trim()) {
          toast.error("Section type is required", { id: toastId });
          setLoading(false);
          return;
        }

        if (!title || !title.trim()) {
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
        sectionData.order_position = orderPosition;

        // Create new section
        await createAboutSection(sectionData);

        toast.success("Section created successfully!", { id: toastId });
      } else {
        // Update existing section - check if section type changed
        const newSectionType = sectionType;
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
          title === item.title &&
          content === item.content &&
          image === null &&
          sectionType === item.section_type &&
          isActive === item.is_active &&
          orderPosition !== item.order_position;

        if (onlyPositionChanged) {
          // Use update endpoint with only order_position for position-only changes
          await updateAboutSection(item.id, { order_position: orderPosition });
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
      
      // Provide more specific error messages based on the error type
      let errorMessage = isCreate ? "Failed to create section" : "Failed to update section";
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || "Invalid request. Please check your input.";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (status === 404) {
          errorMessage = "Section not found. It may have been deleted.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle(item?.title || "");
    setContent(item?.content || "");
    setImage(null);
    setSectionType(item?.section_type || "");
    setCustomSectionType(item?.section_type || "");
    setShowSectionTypeDropdown(false);
    setShowPositionDropdown(false);
    setOrderPosition(item?.order_position || 1);
    setIsActive(item?.is_active ?? true);
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        resetForm();
      } else {
        // Reset form for create mode
        setTitle("");
        setContent("");
        setImage(null);
        setSectionType("");
        setCustomSectionType("");
        setShowSectionTypeDropdown(false);
        setShowPositionDropdown(false);
        
        // Auto-select smallest unused position for create mode
        const maxPosition = Math.max(10, ...(existingOrderPositions?.filter(p => typeof p === 'number') || [])) + 2;
        const usedPositions = new Set(existingOrderPositions || []);
        let smallestUnused = 1;
        while (usedPositions.has(smallestUnused) && smallestUnused <= maxPosition) {
          smallestUnused++;
        }
        setOrderPosition(smallestUnused);
        
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
                  {isCreate ? "Create About Section" : `Update About (${item.section_type})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new about section" : "Edit your about information"}
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
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>

            <input
              type="text"
              value={title}
              placeholder="Enter title..."
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Section Type */}
          <div className="space-y-2" ref={sectionTypeDropdownRef}>
            <label className="text-sm font-medium text-gray-700">Section Type</label>

            {/* Input field with dropdown button */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <input
                type="text"
                value={customSectionType}
                placeholder="e.g., history, mission, vision"
                onChange={(e) => {
                  setCustomSectionType(e.target.value);
                  setSectionType(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm outline-none transition min-w-0"
              />
              {existingSectionTypes.length > 0 && (
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
            {showSectionTypeDropdown && existingSectionTypes.length > 0 && (
              <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-sm max-h-40 overflow-y-auto">
                {existingSectionTypes.map((item, index) => {
                  const type = typeof item === 'string' ? item : (item?.type || '');
                  const isActive = typeof item === 'object' ? item?.isActive : true;
                  const isCurrentSectionType = !isCreate && sectionType && type.toLowerCase() === sectionType?.toLowerCase();
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (isCurrentSectionType) {
                          setShowSectionTypeDropdown(false);
                        }
                      }}
                      className={`w-full px-3 sm:px-4 py-2 text-left text-sm transition flex items-center justify-between ${
                        isCurrentSectionType
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
              <label className="text-sm font-medium text-gray-700">Order Position</label>
              
              {/* Custom dropdown for position */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPositionDropdown(!showPositionDropdown)}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                >
                  <span className={existingOrderPositions.includes(orderPosition) && (!item || item.order_position !== orderPosition) ? "text-gray-700" : ""}>
                    {orderPosition}
                    {item && item.order_position === orderPosition && (
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
                              setOrderPosition(pos);
                              setShowPositionDropdown(false);
                            }
                          }}
                          className={`w-full px-3 py-2 text-left text-sm transition flex items-center justify-between ${
                            isCurrent
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
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
                  {isActive ? "Active" : "Inactive"}
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
              <label className="relative group block rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm cursor-pointer">
                <img
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : item?.image_url || "/placeholder.png"
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
                value={content}
                placeholder="Enter description..."
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full min-h-[160px] sm:min-h-[200px] md:min-h-[250px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
              />
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-4 sm:px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={handleSave}
                className="px-4 sm:px-5 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F65919] focus:ring-offset-2 transition disabled:opacity-60"
              >
                {loading ? (isCreate ? "Creating..." : "Saving...") : (isCreate ? "Create" : "Save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
