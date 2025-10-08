import React, { useState, useEffect } from "react";

interface EditableCellProps {
  value: string | number | null;
  onChange: (value: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}
export default function EditableCell({
  value,
  onChange,
  isSelected,
  onSelect,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value ?? ""));

  useEffect(() => {
    setTempValue(String(value ?? ""));
  }, [value]);

  const handleSingleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      setIsEditing(false);
      onChange(tempValue);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setTempValue(String(value ?? ""));
    }
  };

  return (
    <div
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      className={`w-full h-full px-2 py-1 flex items-center transition-all duration-75 ${
        isSelected ? "ring-1 ring-blue-400" : ""
      }`}
    >
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full h-full bg-transparent border-none outline-none"
        />
      ) : (
        <span className="w-full truncate select-none">{value ?? ""}</span>
      )}
    </div>
  );
}