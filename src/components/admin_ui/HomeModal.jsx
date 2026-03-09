import { useState, useEffect } from "react";

// import heroicons
import {
  XMarkIcon,
  HomeIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

//import home api services
import { updateHomeSection } from "../../lib/services/homeService";

export default function HomeModal({ isOpen, onClose, item }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  //fetch data
  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setContent(item.content || "");
    }
  }, [item]);

  //handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  //handle save
  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

      await updateHomeSection(item.id, formData);

      onClose();
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setLoading(false);
    }
  };

  //reset form
  const resetForm = () => {
    setTitle(item.title || "");
    setContent(item.content || "");
    setImage(null);
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      {/* Modal */}
      <div className="bg-[#FEF2F3] w-[90%] max-w-[720px] rounded-2xl shadow-xl animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-t-2xl px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-200 p-3 rounded-xl">
              <HomeIcon className="w-6 h-6 text-red-500" />
            </div>

            <div>
              <h2 className="text-2xl font-bold">
                Update Home ({item.section_type})
              </h2>

              <p className="text-sm text-gray-500">
                Edit your home information
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            type="button"
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-200 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
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

          {/* Content Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Image Upload */}
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

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-orange-500 rounded-full p-3 mb-2 shadow">
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

            {/* Description */}
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={content}
                placeholder="Enter description..."
                rows={8}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none transition"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
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
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
