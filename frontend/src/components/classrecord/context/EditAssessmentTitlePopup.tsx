import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Dispatch, SetStateAction } from "react";

export interface EditingAssessment {
  nodeKey: string;
  value: string;
  coords: { x: number; y: number };
}

interface EditAssessmentTitlePopupProps {
  editingAssessment: EditingAssessment | null;
  setEditingAssessment: Dispatch<SetStateAction<EditingAssessment | null>>;
  handleEditSave: (nodeKey: string, newValue: string) => void;
  handleEditCancel: () => void;
}

export default function EditAssessmentTitlePopup({
  editingAssessment,
  handleEditSave,
  handleEditCancel,
}: EditAssessmentTitlePopupProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  const [inputValue, setInputValue] = useState(editingAssessment?.value || "");

  const activeKeyRef = useRef<string | null>(null);
 
  const hasSavedRef = useRef(false);

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
    if (editingAssessment) {
      activeKeyRef.current = editingAssessment.nodeKey;
      hasSavedRef.current = false;
      setInputValue(editingAssessment.value || "");
    } else {
      activeKeyRef.current = null;
    }
  }, [editingAssessment]);

  const handleLocalSave = useCallback(() => {
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    const key = activeKeyRef.current;
    if (!key) return;

    handleEditSave(key, inputValue);
  }, [inputValue, handleEditSave]);

  if (!editingAssessment || !containerRef.current) return null;

  return createPortal(
    <div
      ref={popupContentRef}
      style={{
        position: "fixed",
        top: editingAssessment.coords.y,
        left: editingAssessment.coords.x,
        zIndex: 99999,
      }}
      className="bg-white border border-[#E9E6E6] rounded-sm"
    >
      <input
        id={`edit_assessment_input-${editingAssessment.nodeKey}`}
        name={`edit_assessment_input-${editingAssessment.nodeKey}`}
        type="text"
        value={inputValue}
        autoFocus
        onBlur={handleLocalSave}
        className="border-none outline-none p-2 px-4 rounded w-full"
        onChange={(e) => setInputValue(e.target.value)}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleLocalSave();
          }
          if (e.key === "Escape") {
            hasSavedRef.current = true;
            handleEditCancel();
          }
        }}
      />
    </div>,
    containerRef.current
  );
}
