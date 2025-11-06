import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Assessment } from "../../../types/classRecordTypes";

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  assessmentId: number;
  bloomsOptions: { id: number; name: string }[];
  outcomesOptions: { id: number; name: string }[];
  handleUpdateAssessment: (
    assessmentId: number,
    updates: Partial<Assessment>
  ) => void;
  initialBlooms?: number[];
  initialOutcomes?: number[];
}

export default function AssessmentInfoContextMenu({
  x,
  y,
  onClose,
  assessmentId,
  bloomsOptions,
  outcomesOptions,
  handleUpdateAssessment,
  initialBlooms = [],
  initialOutcomes = [],
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedBlooms, setSelectedBlooms] = useState<string[]>(
    initialBlooms.map(String)
  );
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>(
    initialOutcomes.map(String)
  );

  useEffect(() => {
    setSelectedBlooms(initialBlooms.map(String));
  }, [initialBlooms]);

  useEffect(() => {
    setSelectedOutcomes(initialOutcomes.map(String));
  }, [initialOutcomes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleBloomToggle(id: string) {
    setSelectedBlooms((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((b) => b !== id)
        : [...prev, id];
      handleUpdateAssessment(assessmentId, {
        blooms_classification: updated.map(Number),
      });
      return updated;
    });
  }

  function handleOutcomeToggle(id: string) {
    setSelectedOutcomes((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((o) => o !== id)
        : [...prev, id];
      handleUpdateAssessment(assessmentId, {
        course_outcome: updated.map(Number),
      });
      return updated;
    });
  }

  const menu = (
    <div
      ref={menuRef}
      className="absolute bg-white shadow-lg rounded-lg border border-gray-300 p-3 z-[9999] w-64 space-y-3 text-gray-900"
      style={{ top: y, left: x }}
    >
      {bloomsOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Bloom’s Classification
          </label>
          <div className="max-h-32 overflow-y-auto border rounded p-1">
            {bloomsOptions.map((b) => (
              <label key={b.id} className="flex items-center space-x-2 py-0.5">
                <input
                  id={`bloom_checkbox-${b.id}-${assessmentId}`}
                  name={`bloom_checkbox-${b.id}-${assessmentId}`}
                  type="checkbox"
                  checked={selectedBlooms.includes(String(b.id))}
                  onChange={() => handleBloomToggle(String(b.id))}
                />
                <span className="text-sm">{b.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {outcomesOptions.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Course Outcomes
          </label>
          <div className="max-h-32 overflow-y-auto border rounded p-1">
            {outcomesOptions.map((o) => (
              <label key={o.id} className="flex items-center space-x-2 py-0.5">
                <input
                  id={`outcome_checkbox-${o.id}-${assessmentId}`}
                  name={`outcome_checkbox-${o.id}-${assessmentId}`}
                  type="checkbox"
                  checked={selectedOutcomes.includes(String(o.id))}
                  onChange={() => handleOutcomeToggle(String(o.id))}
                />
                <span className="text-sm">{o.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(menu, document.body);
}