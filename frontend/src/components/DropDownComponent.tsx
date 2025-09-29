import { useEffect, useRef, useState } from "react";
import ChevronDown from "../assets/chevron-down-solid.svg?react";

export type DropdownOption = { value: string; label: string };

type DropdownProps = {
  label: string;
  name: string;
  options: DropdownOption[];
  value: string;
  required?: boolean;
  showAsterisk?: boolean;
  error?: string;
  onChange: (name: string, value: string) => void;
  onClearError?: (name: string) => void;
  loading?: boolean;
  readOnly?: boolean;
};

export default function DropdownComponent({
  label,
  name,
  options,
  value,
  required = false,
  showAsterisk = true,
  error,
  onChange,
  onClearError,
  loading = false,
  readOnly = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(name, optionValue);
    setIsOpen(false);

    if (onClearError) {
      onClearError(name);
    }
  };

  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => {
        onClearError(name);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, name, onClearError]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm mb-1">
        {label}
        {required && showAsterisk && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <button
        type="button"
        disabled={loading}
        className={`flex items-center justify-between w-full h-10 px-3 py-2 border rounded-md ${
          error ? "border-red-500" : "border-[#E9E6E6]"
        } ${ readOnly || loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate max-w-full whitespace-nowrap">
          {options.find((o) => o.value === value)?.label ?? ""}
        </span>
        <ChevronDown
          className={`h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute w-full bg-white border border-[#E9E6E6] rounded-md z-10 max-h-60 overflow-y-auto">
          <div
            key=""
            className={`h-10 px-3 py-2 cursor-pointer rounded-lg truncate max-w-full whitespace-nowrap ${
              value === "" ? "bg-gray-100" : ""
            } text-gray-400`}
            onClick={() => handleSelect("")}
          >
            {""}
          </div>

          {options.map((option) => (
            <div
              key={option.value}
              className={`h-10 px-3 py-2 cursor-pointer rounded-lg truncate max-w-full whitespace-nowrap ${
                value === option.value ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      <div className="h-5 mt-2">
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
