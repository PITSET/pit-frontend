import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// api
import { createProject, updateProject } from "../../lib/services/projectService";
import { supabase } from "../../lib/supabaseClient";

export default function ProjectModal({ isOpen, onClose, onRefresh, item }) {
  const isCreate = !item;
  const [name, setName] = useState("");
  const [overview, setOverview] = useState("");
  const [objectives, setObjectives] = useState("");
  const [tasks, setTasks] = useState("");
  const [leader, setLeader] = useState("");
  const [duration, setDuration] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Multiple images state
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Close dropdown when clicking outside
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        // Handle dropdown close if needed
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [urlValidation, setUrlValidation] = useState({
    isValid: null,
    message: "",
  });

  // Extract YouTube video ID from various URL formats
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;

    // Handle full iframe code
    if (url.includes("<iframe") && url.includes("src=")) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        url = srcMatch[1];
      }
    }

    // YouTube patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
      /youtube\.com\/shorts\/([^&?/]+)/,
      /youtube\.com\/live\/([^&?/]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Validate URL format and check if it's a valid YouTube URL
  const validateUrl = (url) => {
    if (!url) {
      setUrlValidation({ isValid: null, message: "" });
      return false;
    }

    const videoId = extractYouTubeVideoId(url);

    if (videoId) {
      setUrlValidation({ isValid: true, message: "Valid YouTube video" });
      return true;
    }

    if (url.includes("youtube.com/embed/") && !url.includes("/embed/")) {
      setUrlValidation({
        isValid: false,
        message: "Invalid embed URL format",
      });
      return false;
    }

    setUrlValidation({
      isValid: false,
      message: "Please enter a valid YouTube URL",
    });
    return false;
  };

  // Handle video URL change with validation
  const handleVideoUrlChange = (e) => {
    const value = e.target.value;

    let extractedUrl = value;
    if (value.includes("<iframe") && value.includes("src=")) {
      const srcMatch = value.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        extractedUrl = srcMatch[1];
      }
    }

    setVideoUrl(extractedUrl);
    validateUrl(extractedUrl);
  };

  // Test video URL
  const handleTestVideoUrl = () => {
    if (!videoUrl) {
      toast.error("Please enter a video URL first");
      return;
    }

    if (!validateUrl(videoUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    let urlToOpen = videoUrl;
    if (videoUrl.includes("<iframe") && videoUrl.includes("src=")) {
      const srcMatch = videoUrl.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        urlToOpen = srcMatch[1];
      }
    }

    window.open(urlToOpen, "_blank", "noopener,noreferrer");
    toast.success("Opening video link in new tab");
  };

  // Handle image select
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload image files only");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be smaller than 10MB");
        return;
      }
    }

    setNewImages((prev) => [...prev, ...files]);
    toast.success(`${files.length} image(s) selected`);
  };

  // Remove new image
  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
    const toastId = toast.loading(isCreate ? "Creating project..." : "Saving changes...");

    try {
      setLoading(true);

      // Handle image uploads
      let imageUrls = [...existingImages];

      // Delete old images that were removed
      if (item?.images) {
        const currentImages = item.images;
        for (const oldUrl of currentImages) {
          if (!imageUrls.includes(oldUrl)) {
            try {
              const urlParts = oldUrl.split("/");
              const fileName = urlParts[urlParts.length - 1].split("?")[0];
              if (fileName) {
                await supabase.storage.from("project_images").remove([fileName]);
              }
            } catch (err) {
              console.warn("Failed to delete old image:", err);
            }
          }
        }
      }

      // Upload new images
      if (newImages.length > 0) {
        for (const image of newImages) {
          const safeName = (name || "new-project")
            .replace(/\s+/g, "-")
            .toLowerCase();

          const fileName = `project-${safeName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;

          toast.loading("Compressing & uploading image...", { id: toastId });

          const webpImage = await convertToWebp(image);

          const { error: uploadError } = await supabase.storage
            .from("project_images")
            .upload(fileName, webpImage, {
              upsert: true,
              cacheControl: "3600",
              contentType: "image/webp",
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data } = supabase.storage
            .from("project_images")
            .getPublicUrl(fileName);

          imageUrls.push(`${data.publicUrl}?t=${Date.now()}`);
        }
      }

      const projectData = {
        name,
        overview,
        objectives,
        tasks,
        leader,
        duration,
        team_size: teamSize ? parseInt(teamSize) : null,
        video_url: videoUrl,
        github_url: githubUrl,
        images: imageUrls,
        is_featured: isFeatured,
        is_active: isActive,
      };

      if (isCreate) {
        // Validate required fields
        if (!name || !name.trim()) {
          toast.error("Project name is required", { id: toastId });
          setLoading(false);
          return;
        }

        // Create new project
        await createProject(projectData);

        toast.success("Project created successfully!");
      } else {
        // Update existing project
        await updateProject(item.id, projectData);
        toast.success("Project updated successfully!", { id: toastId });
      }

      // auto-refresh parent data
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = isCreate ? "Failed to create project" : "Failed to update project";
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || "Invalid request. Please check your input.";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (status === 404) {
          errorMessage = "Project not found. It may have been deleted.";
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
    setOverview(item?.overview || "");
    setObjectives(item?.objectives || "");
    setTasks(item?.tasks || "");
    setLeader(item?.leader || "");
    setDuration(item?.duration || "");
    setTeamSize(item?.team_size?.toString() || "");
    setVideoUrl(item?.video_url || "");
    setGithubUrl(item?.github_url || "");
    setExistingImages(item?.images || []);
    setNewImages([]);
    setIsFeatured(item?.is_featured || false);
    setIsActive(item?.is_active ?? true);
    validateUrl(item?.video_url || "");
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (item) {
        resetForm();
      } else {
        // Reset form for create mode
        setName("");
        setOverview("");
        setObjectives("");
        setTasks("");
        setLeader("");
        setDuration("");
        setTeamSize("");
        setVideoUrl("");
        setGithubUrl("");
        setExistingImages([]);
        setNewImages([]);
        setIsFeatured(false);
        setIsActive(true);
        setUrlValidation({ isValid: null, message: "" });
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
                <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {isCreate ? "Create Project" : `Update Project (${item?.name})`}
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  {isCreate ? "Add a new project" : "Edit your project information"}
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
          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Project Name</label>

            <input
              type="text"
              value={name}
              placeholder="Enter project name..."
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Featured & Status toggles */}
          <div className="grid grid-cols-2 gap-4">
            {/* Featured */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-gray-700">Featured</label>
              <div className="flex items-center gap-3 py-2">
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isFeatured ? "bg-purple-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isFeatured ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isFeatured ? "text-purple-600" : "text-gray-500"}`}>
                  {isFeatured ? "Featured" : "Regular"}
                </span>
              </div>
            </div>

            {/* Status */}
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

          {/* Leader & Team Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Leader */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Project Leader</label>

              <input
                type="text"
                value={leader}
                placeholder="Enter project leader name..."
                onChange={(e) => setLeader(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Team Size</label>

              <input
                type="number"
                value={teamSize}
                placeholder="Enter team size..."
                onChange={(e) => setTeamSize(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                min="1"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Duration</label>

            <input
              type="text"
              value={duration}
              placeholder="e.g., 3 months, 6 weeks..."
              onChange={(e) => setDuration(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Project Images</label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {existingImages.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Project ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {newImages.map((file, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image Button */}
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition">
                <ArrowUpTrayIcon className="w-6 h-6 mx-auto text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload images</span>
                <span className="text-xs text-gray-400 block">JPG, PNG up to 10MB each</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Overview
            </label>

            <textarea
              value={overview}
              placeholder="Enter project overview..."
              onChange={(e) => setOverview(e.target.value)}
              className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Objectives
            </label>

            <textarea
              value={objectives}
              placeholder="Enter project objectives..."
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tasks
            </label>

            <textarea
              value={tasks}
              placeholder="Enter project tasks..."
              onChange={(e) => setTasks(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Video URL (YouTube)</label>
            
            <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
              <input
                type="text"
                value={videoUrl}
                placeholder="Paste YouTube URL..."
                onChange={handleVideoUrlChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm outline-none transition min-w-0"
              />
              <button
                type="button"
                onClick={handleTestVideoUrl}
                className="flex items-center justify-center px-3 sm:px-4 bg-gray-50 border-l border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                title="Test URL"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-5 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            {urlValidation.message && (
              <div className={`flex items-center gap-1 text-xs ${
                urlValidation.isValid === true ? "text-green-600" : "text-red-500"
              }`}>
                {urlValidation.isValid === true ? (
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                ) : (
                  <ExclamationCircleIcon className="w-3.5 h-3.5" />
                )}
                {urlValidation.message}
              </div>
            )}
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">GitHub URL</label>

            <input
              type="text"
              value={githubUrl}
              placeholder="https://github.com/username/repo"
              onChange={(e) => setGithubUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.target.blur();
                }
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
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
  );
}
