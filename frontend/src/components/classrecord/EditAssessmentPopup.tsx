import { useRef, useEffect, useState } from "react"; // <-- Import useState
import { createPortal } from "react-dom";
import type { Dispatch, SetStateAction } from "react";

// (Interface definitions remain the same)
export interface EditingAssessment {
  nodeKey: string;
  value: string;
  coords: { top: number; left: number; width: number; height: number };
}

interface EditAssessmentPopupProps {
  editingAssessment: EditingAssessment | null; 
  setEditingAssessment: Dispatch<SetStateAction<EditingAssessment | null>>;
  handleEditSave: (nodeKey: string, newValue: string) => void; // <-- Note: handler needs new value
  handleEditCancel: () => void;
}

export default function EditAssessmentPopup({
  editingAssessment,
  // setEditingAssessment, // We no longer need to update the parent state on every keystroke
  handleEditSave,
  handleEditCancel,
}: EditAssessmentPopupProps) {
  
  // 1. LOCAL STATE for the input value
  const [inputValue, setInputValue] = useState(editingAssessment?.value || "");

  // 2. SYNCHRONIZE local state with prop when editingAssessment changes
  useEffect(() => {
    if (editingAssessment) {
      setInputValue(editingAssessment.value);
    }
  }, [editingAssessment]);


  // --- (Refs and Click-Outside logic remain the same) ---
  const containerRef = useRef<HTMLDivElement | null>(null); 
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  // Effect for creating and cleaning up the DOM node
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

  // Effect for handling the "Click Outside" logic
  useEffect(() => {
    if (!editingAssessment) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupContentRef.current && 
        !popupContentRef.current.contains(event.target as Node)
      ) {
        // When clicking outside, we treat it as a cancel
        handleEditCancel(); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingAssessment, handleEditCancel]);
  // --------------------------------------------------------


  if (!editingAssessment || !containerRef.current) {
    return null;
  }
  
  // 3. UPDATED HANDLERS to use local state
  const handleLocalSave = () => {
    // Pass the local state value back to the parent component's save function
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
        // Use the local state here
        value={inputValue} 
        autoFocus
        className="border-none outline-none p-2 px-4 rounded w-full"
        // Update the local state here (fast re-render only within this component)
        onChange={(e) => setInputValue(e.target.value)} 
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLocalSave(); // Use the local save handler
          if (e.key === "Escape") handleEditCancel();
        }}
      />
    </div>,
    containerRef.current
  );
}