import { XMarkIcon } from "@heroicons/react/24/outline";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
}
