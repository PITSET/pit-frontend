import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// heroicons
import {
  XMarkIcon,
  InformationCircleIcon,
  ArrowUpTrayIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

// api
import { updateAboutSection } from "../../lib/services/aboutService";
import { supabase } from "../../lib/supabaseClient";

export default function AboutModal({ isOpen, onClose, onRefresh, item }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
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
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/]+)/, // youtube.com/watch?v=, youtu.be/, youtube.com/embed/
      /youtube\.com\/shorts\/([^&?\/]+)/, // youtube.com/shorts/
      /youtube\.com\/live\/([^&?\/]+)/, // youtube.com/live/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  // Get embed URL from video ID
  const getEmbedUrl = (videoId) => {
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
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

    // Check if it's a direct embed URL without video ID
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

    // Extract src URL if user pasted iframe code
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

  // Open video URL in new tab
  const handleTestVideoUrl = () => {
    if (!videoUrl) {
      toast.error("Please enter a video URL first");
      return;
    }

    if (!validateUrl(videoUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Extract URL if user pasted iframe code
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
    const toastId = toast.loading("Saving changes...");

    try {
      setLoading(true);

      let imageUrl = item.image_url;

      if (image) {
        const safeSection = item.section_type
          .replace(/\s+/g, "-")
          .toLowerCase();

        const fileName = `about-${safeSection}.webp`;

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

      // update database
      await updateAboutSection(item.id, {
        title,
        content,
        image_url: imageUrl,
        video_url: videoUrl,
      });

      toast.success("Section updated successfully!", { id: toastId });

      // auto-refresh parent data
      if (onRefresh) {
        await onRefresh();
      }

      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
      toast.error("Failed to update section", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setTitle(item.title || "");
    setContent(item.content || "");
    setImage(null);
    setVideoUrl(item.video_url || "");
    validateUrl(item.video_url || "");
  };

  // Load initial data when modal opens
  useEffect(() => {
    if (isOpen && item) {
      resetForm();
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      {/* Modal */}
      <div className="bg-[#FEF2F3] w-[90%] max-w-[720px] max-h-[90vh] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden flex flex-col my-4">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white rounded-t-2xl px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-200 p-3 rounded-xl">
                <InformationCircleIcon className="w-6 h-6 text-blue-500" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Update About ({item.section_type})
                </h2>

                <p className="text-sm text-gray-500">
                  Edit your about information
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>

            <input
              type="text"
              value={title}
              placeholder="Enter title..."
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Left: Image Upload + Video URL */}
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
                      : item.image_url || "/placeholder.png"
                  }
                  alt="Preview"
                  className="w-full h-[220px] object-cover bg-gray-100 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-primary-gradient rounded-full p-3 mb-2 shadow">
                    <ArrowUpTrayIcon className="w-6 h-6 text-white" />
                  </div>

                  <p className="text-sm font-medium text-white">Upload Photo</p>

                  <p className="text-xs text-white/80">JPG, PNG up to 10MB</p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {/* YouTube Video */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  YouTube Video
                </label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-orange-400">
                  <input
                    type="text"
                    value={videoUrl}
                    placeholder="Paste YouTube URL (youtube.com/watch?v=, youtu.be/, or embed code)"
                    onChange={handleVideoUrlChange}
                    className={`flex-1 px-4 py-2.5 text-sm shadow-sm outline-none transition
                      ${urlValidation.isValid === false ? "border-red-400 focus:ring-red-400" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={handleTestVideoUrl}
                    disabled={!videoUrl}
                    className="flex items-center justify-center px-4 bg-primary-gradient text-white hover:bg-primary-gradient-hover
                      transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Open video link"
                  >
                    <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* URL Validation Feedback */}
                {urlValidation.isValid !== null && (
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      urlValidation.isValid ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {urlValidation.isValid ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <ExclamationCircleIcon className="w-4 h-4" />
                    )}
                    <span>{urlValidation.message}</span>
                  </div>
                )}

                {/* Video Preview */}
                {videoUrl && urlValidation.isValid && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <iframe
                      src={getEmbedUrl(extractYouTubeVideoId(videoUrl))}
                      title="Video Preview"
                      className="w-full aspect-video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
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
                className="flex-1 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
              />
            </div>
          </div>

          {/* Footer - Fixed at bottom */}
          <div className="flex-shrink-0 bg-[#FEF2F3] rounded-b-2xl px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end gap-3">
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
                className="px-5 py-2 rounded-lg text-white font-medium bg-primary-gradient hover:bg-primary-gradient-hover
                active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F65919] focus:ring-offset-2 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
