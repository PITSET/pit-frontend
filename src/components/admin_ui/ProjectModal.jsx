import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  ArrowTopRightOnSquareIcon,
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
  const [objectives, setObjectives] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leader, setLeader] = useState("");
  const [duration, setDuration] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [program, setProgram] = useState("");

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

  // Add objective
  const addObjective = () => {
    setObjectives([...objectives, ""]);
  };

  // Remove objective
  const removeObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  // Update objective
  const updateObjective = (index, value) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  // Add task
  const addTask = () => {
    setTasks([...tasks, ""]);
  };

  // Remove task
  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // Update task
  const updateTask = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index] = value;
    setTasks(newTasks);
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

      // Filter out empty objectives and tasks
      const filteredObjectives = objectives.filter(obj => obj.trim() !== "");
      const filteredTasks = tasks.filter(task => task.trim() !== "");

      const projectData = {
        name,
        overview,
        objectives: filteredObjectives,
        tasks: filteredTasks,
        leader,
        duration,
        team_size: teamSize ? parseInt(teamSize) : null,
        github_url: githubUrl,
        images: imageUrls,
        result,
        is_featured: isActive, // Use is_featured field from backend, but display as Active/Inactive
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
    setObjectives(Array.isArray(item?.objectives) ? item.objectives : []);
    setTasks(Array.isArray(item?.tasks) ? item.tasks : []);
    setLeader(item?.leader || "");
    setDuration(item?.duration?.toString() || "");
    setTeamSize(item?.team_size?.toString() || "");
    setGithubUrl(item?.github_url || "");
    setResult(item?.result || "");
    setExistingImages(item?.images || []);
    setNewImages([]);
    setIsActive(item?.is_featured || false); // Use is_featured field from backend
    setProgram("");
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
        setObjectives([]);
        setTasks([]);
        setLeader("");
        setDuration("");
        setTeamSize("");
        setGithubUrl("");
        setResult("");
        setExistingImages([]);
        setNewImages([]);
        setIsActive(true); // Default to active (is_featured = true)
        setProgram("");
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Image upload */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Project Images</label>
              
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
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Existing Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Project ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
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
                </div>
              )}

              {/* New Images Preview */}
              {newImages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">New Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {newImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
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
                </div>
              )}
            </div>

            {/* Right column - Project details */}
            <div className="space-y-4">
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

              {/* Project Leader */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Leader</label>

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

              {/* Program */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Program</label>

                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                >
                  <option value="">Select program...</option>
                  <option value="mechanical">Mechanical Engineering</option>
                  <option value="electrical">Electrical Engineering</option>
                  <option value="computer">Computer Engineering</option>
                  <option value="civil">Civil Engineering</option>
                </select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Duration</label>

                <input
                  type="text"
                  value={duration}
                  placeholder="e.g., 4 Weeks..."
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

              {/* Team Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Team Size</label>

                <input
                  type="text"
                  value={teamSize}
                  placeholder="e.g., 5 Students..."
                  onChange={(e) => setTeamSize(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    }
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>

              {/* GitHub URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Website URL</label>
                
                <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
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
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm shadow-sm outline-none transition min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => window.open(githubUrl, "_blank", "noopener,noreferrer")}
                    disabled={!githubUrl}
                    className="flex items-center justify-center px-3 sm:px-4 bg-gray-50 border-l border-gray-300 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                    title="Open URL"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-5 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Active/Inactive toggle */}
              <div className="space-y-2">
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
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Overview
            </label>

            <textarea
              value={overview}
              placeholder="Message text goes here..."
              onChange={(e) => setOverview(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
          </div>

          {/* Objectives and Tasks - Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Objectives */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Objectives</label>
              
              <div className="space-y-2">
                {objectives.map((objective, index) => (
                  <div key={`objective-${index}`} className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-900 rounded-full mt-2" />
                    <input
                      type="text"
                      value={objective}
                      placeholder="Add your message here"
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="flex-shrink-0 bg-red-500 text-white rounded-lg p-1.5 hover:bg-red-600 transition"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addObjective}
                  className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Objective</span>
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Tasks & Activities</label>
              
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div key={`task-${index}`} className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-2 h-2 bg-gray-900 rounded-full mt-2" />
                    <input
                      type="text"
                      value={task}
                      placeholder="Add your message here"
                      onChange={(e) => updateTask(index, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="flex-shrink-0 bg-red-500 text-white rounded-lg p-1.5 hover:bg-red-600 transition"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addTask}
                  className="flex items-center gap-1 text-orange-600 hover:text-orange-700 transition"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Results & Conclusion
            </label>

            <textarea
              value={result}
              placeholder="Message text goes here..."
              onChange={(e) => setResult(e.target.value)}
              className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
            />
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
                className="px-6 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover
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
