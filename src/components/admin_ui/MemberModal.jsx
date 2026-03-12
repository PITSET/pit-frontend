import { useState, useEffect, useRef } from "react";
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
} from "@heroicons/react/24/outline";

// api
import { createMember, updateMember } from "../../lib/services/memberService";
import { getAllPrograms } from "../../lib/services/programService";
import { supabase } from "../../lib/supabaseClient";

export default function MemberModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;
  
  // Member fields matching backend
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [email, setEmail] = useState("");
  const [academicAchievements, setAcademicAchievements] = useState("");
  const [skills, setSkills] = useState("");
  const [isFounder, setIsFounder] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [programIds, setProgramIds] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  
  // Image state
  const [existingImage, setExistingImage] = useState("");
  const [newImage, setNewImage] = useState(null);
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

    setNewImage(file);
    toast.success("Image selected");
  };

  // Remove new image
  const removeNewImage = () => {
    setNewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove existing image
  const removeExistingImage = () => {
    setExistingImage("");
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
    const toastId = toast.loading(isCreate ? "Creating member..." : "Saving changes...");

    try {
      setLoading(true);

      // Handle image upload
      let imageUrlToSave = existingImage;

      // Upload new image if selected
      if (newImage) {
        const safeName = (name || "new-member")
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `member-${safeName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;

        toast.loading("Compressing & uploading image...", { id: toastId });

        const webpImage = await convertToWebp(newImage);

        const { error: uploadError } = await supabase.storage
          .from("member_images")
          .upload(fileName, webpImage, {
            upsert: true,
            cacheControl: "3600",
            contentType: "image/webp",
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from("member_images")
          .getPublicUrl(fileName);

        imageUrlToSave = `${data.publicUrl}?t=${Date.now()}`;
      }

      // Parse academic achievements and skills (comma-separated strings to arrays)
      const academicAchievementsArray = academicAchievements
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      const skillsArray = skills
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

      const memberData = {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
        position_title: positionTitle?.trim() || null,
        email: email?.trim() || null,
        image_url: imageUrlToSave || null,
        academic_achievements: academicAchievementsArray.length > 0 ? academicAchievementsArray : [],
        skills: skillsArray.length > 0 ? skillsArray : [],
        is_founder: isFounder,
        is_instructor: isInstructor,
        program_ids: programIds,
      };

      if (isCreate) {
        // Validate required fields for create
        if (!name || !name.trim()) {
          toast.error("Please enter a name", { id: toastId });
          setLoading(false);
          return;
        }

        // At least one role must be selected
        if (!isFounder && !isInstructor) {
          toast.error("Please select at least one role: Founder or Instructor", { id: toastId });
          setLoading(false);
          return;
        }

        // Instructors must be linked to at least one program
        if (isInstructor && programIds.length === 0) {
          toast.error("Instructors must be linked to at least one program", { id: toastId });
          setLoading(false);
          return;
        }

        // Create new member
        await createMember(memberData);

        toast.success("Member created successfully!");
      } else {
        // Validate required fields for update
        if (!name || !name.trim()) {
          toast.error("Please enter a name", { id: toastId });
          setLoading(false);
          return;
        }

        // At least one role must be selected
        if (!isFounder && !isInstructor) {
          toast.error("Please select at least one role: Founder or Instructor", { id: toastId });
          setLoading(false);
          return;
        }

        // Instructors must be linked to at least one program
        if (isInstructor && programIds.length === 0) {
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
      
      // Provide more specific error messages based on the error type
      let errorMessage = isCreate ? "Failed to create member" : "Failed to update member";
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || "Invalid request. Please check your input.";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (status === 404) {
          errorMessage = "Member not found. It may have been deleted.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setName(item?.name || "");
    setBio(item?.bio || "");
    setPositionTitle(item?.position_title || "");
    setEmail(item?.email || "");
    setExistingImage(item?.image_url || "");
    setAcademicAchievements(Array.isArray(item?.academic_achievements) ? item.academic_achievements.join(', ') : "");
    setSkills(Array.isArray(item?.skills) ? item.skills.join(', ') : "");
    setIsFounder(item?.is_founder || false);
    setIsInstructor(item?.is_instructor || false);
    setNewImage(null);
    
    // Get program IDs from the nested structure
    const programIdsArray = item?.team_member_programs?.map(p => p.programs?.id) || [];
    setProgramIds(programIdsArray.filter(id => id));
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        resetForm();
      } else {
        // Reset form for create mode
        setName("");
        setBio("");
        setPositionTitle("");
        setEmail("");
        setExistingImage("");
        setAcademicAchievements("");
        setSkills("");
        setIsFounder(false);
        setIsInstructor(false);
        setNewImage(null);
        setProgramIds([]);
      }
    }
  }, [isOpen, item]);

  // Toggle program selection
  const toggleProgram = (programId) => {
    if (programIds.includes(programId)) {
      setProgramIds(programIds.filter(id => id !== programId));
    } else {
      setProgramIds([...programIds, programId]);
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
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Image upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Member Image</label>
              
              {/* Image upload area */}
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition">
                  <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Drop here to attach or upload</span>
                  <span className="text-xs text-gray-400 block">Max size: 10MB</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </label>

              {/* Existing Image */}
              {(existingImage || newImage) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {newImage ? "New Image Preview" : "Current Image"}
                  </label>
                  <div className="relative group">
                    {newImage ? (
                      <img
                        src={URL.createObjectURL(newImage)}
                        alt="New image preview"
                        className="w-full-cover rounded-lg"
                      />
                    ) : (
                      <img
                        src={existingImage || "/placeholder.svg"}
                        alt="Current member"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={newImage ? removeNewImage : removeExistingImage}
                      className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-2 hover:bg-red-50 transition shadow-md border border-gray-100"
                      title="Remove image"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Member details */}
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  value={name}
                  placeholder="Enter name..."
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>

              {/* Position Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Position Title</label>
                <input
                  type="text"
                  value={positionTitle}
                  placeholder="e.g., Senior Instructor"
                  onChange={(e) => setPositionTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  placeholder="email@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFounder}
                      onChange={(e) => setIsFounder(e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <span className="text-sm text-gray-700">Founder</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInstructor}
                      onChange={(e) => setIsInstructor(e.target.checked)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <span className="text-sm text-gray-700">Instructor</span>
                  </label>
                </div>
              </div>

              {/* Programs - Only show if instructor is selected */}
              {isInstructor && (
                <div className="space-y-2" ref={programDropdownRef}>
                  <label className="text-sm font-medium text-gray-700">Programs *</label>
                  
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
                        <span className={programIds.length > 0 ? "text-gray-900" : "text-gray-500"}>
                          {programIds.length > 0 
                            ? `${programIds.length} program(s) selected`
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
                              className={`w-full px-3 sm:px-4 py-2 text-left text-sm transition flex items-center justify-between ${
                                programIds.includes(program.id)
                                  ? "bg-orange-50 text-orange-600"
                                  : "text-gray-700 bg-white hover:bg-gray-100"
                              }`}
                            >
                              <span>{program.program_name}</span>
                              {programIds.includes(program.id) && (
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Biography</label>
            <textarea
              value={bio}
              placeholder="Enter biography..."
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
          </div>

          {/* Academic Achievements */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Academic Achievements</label>
            <input
              type="text"
              value={academicAchievements}
              placeholder="Enter achievements separated by commas..."
              onChange={(e) => setAcademicAchievements(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <p className="text-xs text-gray-500">Separate multiple achievements with commas</p>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Skills</label>
            <input
              type="text"
              value={skills}
              placeholder="Enter skills separated by commas..."
              onChange={(e) => setSkills(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
            <p className="text-xs text-gray-500">Separate multiple skills with commas</p>
          </div>

          {/* Footer - Not Fixed */}
          <div className="bg-[#FEF2F3] rounded-b-2xl px-4 sm:px-6 py-4 border-t border-gray-200 mt-6">
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
    </div>
  );
}
