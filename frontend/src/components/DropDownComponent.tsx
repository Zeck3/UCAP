import { useEffect, useMemo, useRef, useState } from "react";
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
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        const selectedLabel =
          options.find((o) => o.value === value)?.label ?? "";
        setSearch(selectedLabel);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [options, value]);

  useEffect(() => {
    if (isOpen) return;
    const selectedLabel = options.find((o) => o.value === value)?.label ?? "";
    setSearch(selectedLabel);
  }, [value, isOpen, options]);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const handleSelect = (optionValue: string) => {
    onChange(name, optionValue);
    const selectedLabel =
      options.find((o) => o.value === optionValue)?.label ?? "";
    setSearch(selectedLabel);
    setIsOpen(false);
    if (onClearError) onClearError(name);
  };

  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => onClearError(name), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, name, onClearError]);

  const disabled = loading || readOnly;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm mb-1 text-[#767676]" htmlFor={name}>
        {label}
        {required && showAsterisk && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </label>

      <div
        className={`flex items-center w-full h-10 px-3 py-2 text-base border rounded-md transition-colors ${
          error ? "border-red-500" : "border-[#E9E6E6]"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        onClick={() => {
          if (disabled) return;
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          id={name}
          name={name}
          disabled={disabled}
          className="flex-1 outline-none bg-transparent truncate"
          placeholder={disabled ? "" : ""}
          value={search}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onChange={(e) => {
            if (disabled) return;
            setSearch(e.target.value);
            setIsOpen(true);
            if (onClearError) onClearError(name);
          }}
        />

        <button
          type="button"
          disabled={disabled}
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation();
            if (disabled) return;
            setIsOpen((prev) => !prev);
            inputRef.current?.focus();
          }}
        >
          <ChevronDown
            className={`h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute mt-px w-full bg-white border border-[#E9E6E6] rounded-md z-10 max-h-60 overflow-y-auto">
          <div
            key="__empty__"
            className={`min-h-10 px-3 py-2 cursor-pointer rounded-lg truncate max-w-full whitespace-nowrap text-gray-400 ${
              value === "" ? "bg-gray-100" : ""
            }`}
            onMouseDown={(e) => e.preventDefault()} // prevent input blur
            onClick={() => handleSelect("")}
          >
            {""}
          </div>

          {filteredOptions.length === 0 ? (
            <div className="min-h-10 px-3 py-2 text-gray-500">No matches found.</div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`min-h-10 px-3 py-2 cursor-pointer rounded-lg truncate max-w-full whitespace-nowrap ${
                  value === option.value ? "bg-gray-100" : ""
                }`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}

      <div className="h-5">
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
