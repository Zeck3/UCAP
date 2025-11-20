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

let portalContainer: HTMLDivElement | null = null;

function getPortalContainer() {
  if (!portalContainer) {
    portalContainer = document.createElement("div");
    document.body.appendChild(portalContainer);
  }
  return portalContainer;
}

export default function EditAssessmentTitlePopup({
  editingAssessment,
  handleEditSave,
  handleEditCancel,
}: EditAssessmentTitlePopupProps) {
  const containerRef = useRef<HTMLDivElement>(getPortalContainer());
  const popupContentRef = useRef<HTMLDivElement | null>(null);

  const [inputValue, setInputValue] = useState(editingAssessment?.value || "");

  const activeKeyRef = useRef<string | null>(null);
 
  const hasSavedRef = useRef(false);

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

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (relatedTarget?.classList.contains('assessment-col')) {
        return;
      }
      handleLocalSave();
    },
    [handleLocalSave]
  );

  useEffect(() => {
    if (!editingAssessment) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (popupContentRef.current?.contains(target)) {
        return;
      }

      if (target.classList.contains('assessment-col') || target.closest('.assessment-col')) {
        return;
      }

      handleLocalSave();
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingAssessment, handleLocalSave]);

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
        onBlur={handleBlur}
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
