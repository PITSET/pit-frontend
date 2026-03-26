// src/components/ui/CustomSelect.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  name,
  label,
  required,
  icon: Icon,
  error,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative w-full flex items-center justify-between px-4 py-2.5 border rounded-xl
          transition-all duration-200 ease-out
          ${
            isOpen
              ? "border-[#8B1A1A] ring-2 ring-[#8B1A1A]/20"
              : error
              ? "border-red-300 focus:border-red-500"
              : "border-gray-300 focus:border-[#8B1A1A] focus:ring-2 focus:ring-[#8B1A1A]/20"
          }
          bg-white outline-none
        `}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />}
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-[fadeIn_0.15s_ease-out]">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange({ target: { name, value: option.value } });
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-3 text-left
                  transition-colors duration-150
                  ${
                    option.value === value
                      ? "bg-red-50 text-[#8B1A1A]"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <span className="font-medium">{option.label}</span>
                {option.value === value && (
                  <CheckIcon className="h-5 w-5 text-[#8B1A1A]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
