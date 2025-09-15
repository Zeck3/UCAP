import { useState, useRef, useEffect } from "react";
import ChevronDown from "../assets/chevron-down-solid.svg?react";

type DropdownProps = {
  label: string;
  options: string[];
  onChange?: (value: string) => void;
};

export default function DropdownComponent({
  label,
  options,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<string>("");

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

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <div className="relative full" ref={dropdownRef}>
      <label className="block text-sm mb-1">{label}</label>
      <button
        type="button"
        className="flex items-center justify-between w-full h-10 px-3 py-2 border border-[#E9E6E6] rounded-md bg-white"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption || ""}</span>
        <ChevronDown
          className={`h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute w-full bg-white border border-[#E9E6E6] rounded-md z-10 max-h-60 overflow-y-auto">
          {["", ...options].map((option, index) => (
            <div
              key={index}
              className={`h-10 px-3 py-2 cursor-pointer rounded-lg ${
                selectedOption === option ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option || ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
