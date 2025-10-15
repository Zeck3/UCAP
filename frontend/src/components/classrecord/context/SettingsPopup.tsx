import { useEffect } from "react";
import { createPortal } from "react-dom";
import AddIcon from "../../../assets/plus-solid.svg?react"
import DeleteIcon from "../../../assets/trash-solid.svg?react";

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
      className="fixed right-0 top-12 w-52 bg-white border border-[#E9E6E6] rounded-lg z-20"
      style={{ top: y, left: x }}
    >
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100 text-sm w-full"
        >
          <AddIcon className="h-5 w-5 ml-4 mr-2 text-[#767676]" />
          <span>{addLabel}</span>
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex items-center gap-2 py-2 cursor-pointer rounded-lg transition hover:bg-gray-100 text-sm text-red-400 w-full"
        >
          <DeleteIcon className="h-5 w-5 ml-4 mr-2" />
          <span>{deleteLabel}</span>
        </button>
      )}
    </div>,
    document.body
  );
}
