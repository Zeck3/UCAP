import { useEffect } from "react";
import { createPortal } from "react-dom";

interface SettingsPopupProps {
  visible: boolean;
  x: number;
  y: number;
  onAdd?: () => void;
  onDelete?: () => void;
  addLabel?: string;
  deleteLabel?: string;
  onClose?: () => void;
}

export default function SettingsPopup({
  visible,
  x,
  y,
  onAdd,
  onDelete,
  addLabel = "Add",
  deleteLabel = "Delete",
  onClose,
}: SettingsPopupProps) {
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = () => {
      if (onClose) onClose();
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  return createPortal(
    <div
      className="fixed z-50 bg-white border rounded-md shadow-lg text-sm w-48"
      style={{ top: y, left: x }}
    >
      {onAdd && (
        <button
          onClick={onAdd}
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          ➕ {addLabel}
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
        >
          🗑️ {deleteLabel}
        </button>
      )}
    </div>,
    document.body
  );
}
