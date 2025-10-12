import { useRef, useEffect, useState } from "react"; // <-- Import useState
import { createPortal } from "react-dom";
import type { Dispatch, SetStateAction } from "react";

export interface EditingAssessment {
  nodeKey: string;
  value: string;
  coords: { top: number; left: number; width: number; height: number };
}

interface EditAssessmentPopupProps {
  editingAssessment: EditingAssessment | null; 
  setEditingAssessment: Dispatch<SetStateAction<EditingAssessment | null>>;
  handleEditSave: (nodeKey: string, newValue: string) => void;
  handleEditCancel: () => void;
}

export default function EditAssessmentPopup({
  editingAssessment,
  handleEditSave,
  handleEditCancel,
}: EditAssessmentPopupProps) {
  
  const [inputValue, setInputValue] = useState(editingAssessment?.value || "");

  useEffect(() => {
    if (editingAssessment) {
      setInputValue(editingAssessment.value);
    }
  }, [editingAssessment]);


  const containerRef = useRef<HTMLDivElement | null>(null); 
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const portalNode = document.createElement("div");
    document.body.appendChild(portalNode);
    containerRef.current = portalNode;
    return () => {
      if (portalNode.parentNode) {
        portalNode.parentNode.removeChild(portalNode);
      }
    };
  }, []);

  useEffect(() => {
    if (!editingAssessment) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupContentRef.current && 
        !popupContentRef.current.contains(event.target as Node)
      ) {
        handleEditCancel(); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingAssessment, handleEditCancel]);


  if (!editingAssessment || !containerRef.current) {
    return null;
  }
  
  const handleLocalSave = () => {
    handleEditSave(editingAssessment.nodeKey, inputValue);
  };
  
  return createPortal(
    <div
      ref={popupContentRef}
      style={{
        top: editingAssessment.coords.top - 4,
        left: editingAssessment.coords.left - 1,
        minWidth: editingAssessment.coords.width,
      }}
      className="transparent absolute z-40 bg-white border border-[#E9E6E6] "
    >
      <input
        type="text"
        value={inputValue} 
        autoFocus
        onBlur={handleLocalSave}
        className="border-none outline-none p-2 px-4 rounded w-full"
        onChange={(e) => setInputValue(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLocalSave();
          if (e.key === "Escape") handleEditCancel();
        }}
      />
    </div>,
    containerRef.current
  );
}