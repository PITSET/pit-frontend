import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  UserIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  CheckIcon,
  StarIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

// api
import { createMember, updateMember } from "../../lib/services/memberService";
import { getAllPrograms } from "../../lib/services/programService";
import { supabase } from "../../lib/supabaseClient";
import { getOperationErrorMessage } from "../../lib/httpErrorHandler";

export default function MemberModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      name: "",
      bio: "",
      email: "",
      academicAchievements: [],
      skills: [],
      isFounder: false,
      isInstructor: false,
      programIds: [],
    },
  });

  // Watch fields for conditional rendering
  const watchIsInstructor = watch("isInstructor");
  const watchEmail = watch("email");
  const watchAcademicAchievements = watch("academicAchievements");
  const watchSkills = watch("skills");
  const watchIsFounder = watch("isFounder");

  // State for non-form data
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  // Image state
  const [image, setImage] = useState(null);
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
    if (!file.type.startsWith("image/") && !file.name.toLowerCase().endsWith('.heic')) {
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

  // Validate email format
  const validateEmail = (emailValue) => {
    if (!emailValue) return true; // Empty is allowed (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  // Handle email change with validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setValue("email", value);

    if (value && !validateEmail(value)) {
      setError("email", { type: "manual", message: "Please enter a valid email address" });
    } else {
      clearErrors("email");
    }
  };

  // Add academic achievement
  const addAcademicAchievement = () => {
    const current = watchAcademicAchievements || [];
    setValue("academicAchievements", [...current, ""]);
  };

  // Remove academic achievement
  const removeAcademicAchievement = (index) => {
    const current = [...(watchAcademicAchievements || [])];
    current.splice(index, 1);
    setValue("academicAchievements", current);
  };

  // Update academic achievement
  const updateAcademicAchievement = (index, value) => {
    const current = [...(watchAcademicAchievements || [])];
    current[index] = value;
    setValue("academicAchievements", current);
  };

  // Add skill
  const addSkill = () => {
    const current = watchSkills || [];
    setValue("skills", [...current, ""]);
  };

  // Remove skill
  const removeSkill = (index) => {
    const current = [...(watchSkills || [])];
    current.splice(index, 1);
    setValue("skills", current);
  };

  // Update skill
  const updateSkill = (index, value) => {
    const current = [...(watchSkills || [])];
    current[index] = value;
    setValue("skills", current);
  };

  // Auto-resize textarea
  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
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
    const toastId = toast.loading(isCreate ? "Creating member..." : "Saving changes...");

    try {
      setLoading(true);

      // Handle image upload
      let imageUrlToSave = item?.image_url || "";

      // Upload new image if selected
      if (image) {
        const safeName = (data.name || "new-member")
          .replace(/\s+/g, "-")
          .toLowerCase();


        const webpImage = await convertToWebp(image);
        const fileExt = webpImage.name.split('.').pop();
        const fileName = `member-${safeName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        toast.loading("Compressing & uploading image...", { id: toastId });

        const { error: uploadError } = await supabase.storage
          .from("member_images")
          .upload(fileName, webpImage, {
            upsert: true,
            cacheControl: "3600",
            contentType: webpImage.type || 'image/webp',
          });

        if (uploadError) {
          // Check for RLS policy violation
          if (uploadError.message?.includes("row-level security") || uploadError.message?.includes("RLS")) {
            throw new Error("Storage permission denied. Please login again or contact administrator.");
          }
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("member_images")
          .getPublicUrl(fileName);

        imageUrlToSave = `${urlData.publicUrl}?t=${Date.now()}`;

        // Delete old image if replacing an existing member's image
        if (item?.image_url) {
          try {
            const oldUrlParts = item.image_url.split("/");
            const oldFileName = oldUrlParts[oldUrlParts.length - 1].split("?")[0];

            if (oldFileName) {
              const { error: deleteError } = await supabase.storage
                .from("member_images")
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

      // Filter out empty achievements and skills
      const filteredAchievements = (data.academicAchievements || []).filter(item => item.trim() !== "");
      const filteredSkills = (data.skills || []).filter(item => item.trim() !== "");

      const memberData = {
        name: data.name?.trim() || null,
        bio: data.bio?.trim() || null,
        email: data.email?.trim() || null,
        image_url: imageUrlToSave || null,
        academic_achievements: filteredAchievements.length > 0 ? filteredAchievements : [],
        skills: filteredSkills.length > 0 ? filteredSkills : [],
        is_founder: data.isFounder,
        is_instructor: data.isInstructor,
        program_ids: data.programIds || [],
      };

      if (isCreate) {
        // Validate required fields for create
        if (!data.name || !data.name.trim()) {
          toast.error("Please enter a name", { id: toastId });
          setLoading(false);
          return;
        }

        if (!data.email || !data.email.trim()) {
          toast.error("Please enter an email", { id: toastId });
          setLoading(false);
          return;
        }

        if (!data.bio || !data.bio.trim()) {
          toast.error("Please enter a biography", { id: toastId });
          setLoading(false);
          return;
        }

        // At least one role must be selected
        if (!data.isFounder && !data.isInstructor) {
          toast.error("Please select at least one role: Founder or Instructor", { id: toastId });
          setLoading(false);
          return;
        }

        // Instructors must be linked to at least one program
        if (data.isInstructor && (data.programIds || []).length === 0) {
          toast.error("Instructors must be linked to at least one program", { id: toastId });
          setLoading(false);
          return;
        }

        // Create new member
        await createMember(memberData);

        toast.success("Member created successfully!");
      } else {
        // Validate required fields for update
        if (!data.name || !data.name.trim()) {
          toast.error("Please enter a name", { id: toastId });
          setLoading(false);
          return;
        }

        if (!data.email || !data.email.trim()) {
          toast.error("Please enter an email", { id: toastId });
          setLoading(false);
          return;
        }

        if (!data.bio || !data.bio.trim()) {
          toast.error("Please enter a biography", { id: toastId });
          setLoading(false);
          return;
        }

        // At least one role must be selected
        if (!data.isFounder && !data.isInstructor) {
          toast.error("Please select at least one role: Founder or Instructor", { id: toastId });
          setLoading(false);
          return;
        }

        // Instructors must be linked to at least one program
        if (data.isInstructor && (data.programIds || []).length === 0) {
          toast.error("Instructors must be linked to at least one program", { id: toastId });
          setLoading(false);
          return;
        }

        // Update existing member
        await updateMember(item.id, memberData);
        toast.success("Member updated successfully!", { id: toastId });
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
        'member'
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
        name: item?.name || "",
        bio: item?.bio || "",
        email: item?.email || "",
        academicAchievements: Array.isArray(item?.academic_achievements) ? item.academic_achievements : [],
        skills: Array.isArray(item?.skills) ? item.skills : [],
        isFounder: item?.is_founder || false,
        isInstructor: item?.is_instructor || false,
        programIds: item?.team_member_programs?.map(p => p.programs?.id) || [],
      });
    } else {
      reset({
        name: "",
        bio: "",
        email: "",
        academicAchievements: [],
        skills: [],
        isFounder: false,
        isInstructor: false,
        programIds: [],
      });
    }
    setImage(null);
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, item]);

  // Toggle program selection
  const toggleProgram = (programId) => {
    const current = watch("programIds") || [];
    if (current.includes(programId)) {
      setValue("programIds", current.filter(id => id !== programId));
    } else {
      setValue("programIds", [...current, programId]);
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
                  {isCreate ? "Create Member" : `Update Member (${item?.name})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new team member" : "Edit member information"}
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Image upload */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">Member Image</label>

                {/* Image Upload */}
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
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Right column - Member details */}
              <div className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter name..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      autoComplete="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address"
                        }
                      })}
                      placeholder="email@example.com"
                      onChange={handleEmailChange}
                      className={`w-full rounded-lg border bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 transition ${errors.email
                          ? "border-red-300 focus:ring-red-400"
                          : watchEmail && validateEmail(watchEmail)
                            ? "border-green-300 focus:ring-green-400"
                            : "border-gray-300 focus:ring-orange-400"
                        }`}
                    />
                    {watchEmail && validateEmail(watchEmail) && !errors.email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message}</p>
                  )}
                  {watchEmail && !errors.email && validateEmail(watchEmail) && (
                    <p className="text-xs text-green-600">Valid email address</p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                  <div className="space-y-3">
                    {/* Founder Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${watchIsFounder ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <StarIcon className={`w-5 h-5 ${watchIsFounder ? 'text-orange-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Founder</p>
                          <p className="text-xs text-gray-500">Organization founder/co-founder</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue("isFounder", !watchIsFounder)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${watchIsFounder ? "bg-primary-gradient" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${watchIsFounder ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    {/* Instructor Toggle */}
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${watchIsInstructor ? 'bg-orange-100' : 'bg-gray-100'}`}>
                          <AcademicCapIcon className={`w-5 h-5 ${watchIsInstructor ? 'text-orange-500' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Instructor</p>
                          <p className="text-xs text-gray-500">Teaches in programs</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setValue("isInstructor", !watchIsInstructor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${watchIsInstructor ? "bg-primary-gradient" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${watchIsInstructor ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Programs - Only show if instructor is selected */}
                {watchIsInstructor && (
                  <div className="space-y-2" ref={programDropdownRef}>
                    <label className="text-sm font-medium text-gray-700">Programs <span className="text-red-500">*</span></label>

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
                          <span className={(watch("programIds") || []).length > 0 ? "text-gray-900" : "text-gray-500"}>
                            {(watch("programIds") || []).length > 0
                              ? `${(watch("programIds") || []).length} program(s) selected`
                              : "Select program(s)..."}
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
                                onClick={() => toggleProgram(program.id)}
                                className={`w-full px-3 sm:px-4 py-2 text-left text-sm transition flex items-center justify-between ${(watch("programIds") || []).includes(program.id)
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-700 bg-white hover:bg-gray-100"
                                  }`}
                              >
                                <span>{program.program_name}</span>
                                {(watch("programIds") || []).includes(program.id) && (
                                  <CheckIcon className="w-4 h-4 text-orange-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 mt-6">
              <label className="text-sm font-medium text-gray-700">Biography <span className="text-red-500">*</span></label>
              <textarea
                {...register("bio", { required: "Biography is required" })}
                placeholder="Enter biography..."
                className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
              />
              {errors.bio && (
                <p className="text-xs text-red-500">{errors.bio.message}</p>
              )}
            </div>

            {/* Academic Achievements */}
            <div className="space-y-3 mt-6">
              <label className="text-sm font-medium text-gray-700">Academic Achievements</label>

              <div className="space-y-2">
                {(watchAcademicAchievements || []).length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No academic achievements added yet
                  </div>
                ) : (
                  (watchAcademicAchievements || []).map((achievement, index) => (
                    <div key={`achievement-${index}`} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:border-orange-300 transition group">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                        <span className="text-xs font-medium text-orange-600">{index + 1}</span>
                      </div>
                      <textarea
                        rows={1}
                        value={achievement}
                        placeholder="Add academic achievement"
                        onChange={(e) => {
                          updateAcademicAchievement(index, e.target.value);
                          adjustTextareaHeight(e.target);
                        }}
                        onInput={(e) => adjustTextareaHeight(e.target)}
                        className="flex-1 bg-transparent border-0 text-sm resize-none overflow-hidden focus:outline-none focus:ring-0"
                        style={{ minHeight: '24px', height: '24px' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeAcademicAchievement(index)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100 mt-1"
                        title="Remove achievement"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={addAcademicAchievement}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Add Academic Achievement</span>
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3 mt-6">
              <label className="text-sm font-medium text-gray-700">Skills</label>

              <div className="space-y-2">
                {(watchSkills || []).length === 0 ? (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    No skills added yet
                  </div>
                ) : (
                  (watchSkills || []).map((skill, index) => (
                    <div key={`skill-${index}`} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm hover:border-orange-300 transition group">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                        <StarIcon className="w-3 h-3 text-blue-600" />
                      </div>
                      <textarea
                        rows={1}
                        value={skill}
                        placeholder="Add skill"
                        onChange={(e) => {
                          updateSkill(index, e.target.value);
                          adjustTextareaHeight(e.target);
                        }}
                        onInput={(e) => adjustTextareaHeight(e.target)}
                        className="flex-1 bg-transparent border-0 text-sm resize-none overflow-hidden focus:outline-none focus:ring-0"
                        style={{ minHeight: '24px', height: '24px' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeSkill(index)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100 mt-1"
                        title="Remove skill"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Add Skill</span>
                </button>
              </div>
            </div>

            {/* Footer - Not Fixed */}
            <div className="bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-4 border-t border-gray-200 mt-6">
              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F65919] focus:ring-offset-2 transition disabled:opacity-60"
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
