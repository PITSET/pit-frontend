import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  UserIcon,
  ArrowUpTrayIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

// api
import { createStudent, updateStudent } from "../../lib/services/studentService";
import { getAllPrograms } from "../../lib/services/programService";
import { supabase } from "../../lib/supabaseClient";
import { getOperationErrorMessage } from "../../lib/httpErrorHandler";

export default function StudentModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;
  
  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      programId: "",
    },
  });

  // Program ID watch for dropdown
  const programId = watch("programId");
  
  // Non-form state
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [image, setImage] = useState(null);
  
  // Refs
  const fileInputRef = useRef(null);
  const programDropdownRef = useRef(null);

  // Fetch programs when modal opens
  useEffect(() => {
    const fetchPrograms = async () => {
      if (isOpen) {
        setProgramsLoading(true);
        try {
          const response = await getAllPrograms();
          setPrograms(response.data);
        } catch (error) {
          console.error("Failed to fetch programs:", error);
          toast.error("Failed to fetch programs");
        } finally {
          setProgramsLoading(false);
        }
      }
    };

    fetchPrograms();
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (programDropdownRef.current && !programDropdownRef.current.contains(event.target)) {
        setShowProgramDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle image select
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload image files only");
      return;
    }

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
          name: item.name || "",
          email: item.email || "",
          programId: item.program_id || "",
        });
        setImage(null);
      } else {
        reset({
          name: "",
          email: "",
          programId: "",
        });
        setImage(null);
      }
    }
  }, [isOpen, item, reset]);

  // Get selected program name
  const selectedProgram = programs.find(p => p.id === programId);
  const selectedProgramName = selectedProgram?.program_name || selectedProgram?.name || "";

  // Form submission
  const onSubmit = async (data) => {
    const toastId = toast.loading(isCreate ? "Creating..." : "Saving...");

    try {
      setLoading(true);

      // Handle image upload
      let imageUrlToSave = item?.image_url || "";

      // Upload new image if selected
      if (image) {
        const safeName = (data.name || "new-student")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `student-${safeName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;

        toast.loading("Compressing & uploading image...", { id: toastId });

        const webpImage = await convertToWebp(image);

        const { error: uploadError } = await supabase.storage
          .from("student_images")
          .upload(fileName, webpImage, {
            upsert: true,
            cacheControl: "3600",
            contentType: "image/webp",
          });

        if (uploadError) {
          // Check for RLS policy violation
          if (uploadError.message?.includes("row-level security") || uploadError.message?.includes("RLS")) {
            throw new Error("Storage permission denied. Please login again or contact administrator.");
          }
          throw uploadError;
        }

        const { data: uploadData } = supabase.storage
          .from("student_images")
          .getPublicUrl(fileName);

        imageUrlToSave = `${uploadData.publicUrl}?t=${Date.now()}`;

        // Delete old image if replacing an existing student's image
        if (item?.image_url) {
          try {
            const oldUrlParts = item.image_url.split("/");
            const oldFileName = oldUrlParts[oldUrlParts.length - 1].split("?")[0];
            
            if (oldFileName) {
              const { error: deleteError } = await supabase.storage
                .from("student_images")
                .remove([oldFileName]);
              
              if (deleteError) {
                console.warn("Failed to delete old image:", deleteError);
              }
            }
          } catch (err) {
            console.warn("Error deleting old image:", err);
          }
        }
      }

      const studentData = {
        name: data.name?.trim() || null,
        email: data.email?.trim() || null,
        image_url: imageUrlToSave || null,
        program_id: data.programId || null,
      };

      if (isCreate) {
        await createStudent(studentData);
        toast.success("Created successfully!", { id: toastId });
      } else {
        await updateStudent(item.id, studentData);
        toast.success("Saved successfully!", { id: toastId });
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
        'student'
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
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isCreate ? "Create Student" : `Update Student (${item?.name})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new student" : "Edit student information"}
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Image upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Student Image</label>
              
              {/* Image Upload */}
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
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {image ? "Change" : "Upload Photo"}
                  </span>
                  <span className="text-white/80 text-xs mt-1">
                    JPG, PNG up to 10MB
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Image filename display */}
              {image && (
                <p className="text-xs text-gray-500 truncate">
                  Selected: {image.name}
                </p>
              )}
            </div>

            {/* Right column - Form fields */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  placeholder="Enter student name"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                  placeholder="Enter email address"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Program */}
              <div ref={programDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Program <span className="text-red-500">*</span>
                </label>
                {programsLoading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    <span>Loading programs...</span>
                  </div>
                ) : (
                  <>
                    {/* Custom dropdown button */}
                    <button
                      type="button"
                      onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                      className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    >
                      <span className={programId ? "text-gray-900" : "text-gray-500"}>
                        {selectedProgramName || "Select a program..."}
                      </span>
                      <ChevronDownIcon 
                        className={`w-4 h-4 text-gray-500 transition-transform ${showProgramDropdown ? "rotate-180" : ""}`} 
                      />
                    </button>

                    {/* Dropdown options */}
                    {showProgramDropdown && (
                      <div className="mt-1 rounded-lg border border-gray-300 bg-white shadow-sm max-h-40 overflow-y-auto">
                        {programs.map(program => (
                          <button
                            key={program.id}
                            type="button"
                            onClick={() => {
                              setValue("programId", program.id);
                              setShowProgramDropdown(false);
                            }}
                            className={`w-full px-3 sm:px-4 py-2 text-left text-sm transition flex items-center justify-between ${
                              programId === program.id
                                ? "bg-orange-50 text-orange-600"
                                : "text-gray-700 bg-white hover:bg-gray-100"
                            }`}
                          >
                            <span>{program.program_name || program.name}</span>
                            {programId === program.id && (
                              <CheckIcon className="w-4 h-4 text-orange-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {errors.programId && (
                  <p className="mt-1 text-xs text-red-500">{errors.programId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 bg-white rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-gradient text-white font-medium rounded-lg hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isCreate ? "Create" : "Save"}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
