import { useCallback, useEffect, useRef, useState } from "react";
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

const BLOOM_COLORS: Record<string, string> = {
  Remember: "bg-blue-100 text-blue-800 border-blue-300",
  Understand: "bg-green-100 text-green-800 border-green-300",
  Apply: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Analyze: "bg-orange-100 text-orange-800 border-orange-300",
  Evaluate: "bg-red-100 text-red-800 border-red-300",
  Create: "bg-purple-100 text-purple-800 border-purple-300",
};

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
      const target = e.target as HTMLElement;

      const toggleButton = target.closest("[data-assessment-info-toggle]");
      if (toggleButton) {
        const toggleAssessmentId = toggleButton.getAttribute(
          "data-assessment-info-toggle"
        );
        if (toggleAssessmentId === String(assessmentId)) {
          return;
        }
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, assessmentId]);

  const toggleBloom = useCallback(
    (id: string) => {
      setSelectedBlooms((prev) => {
        const updated = prev.includes(id)
          ? prev.filter((b) => b !== id)
          : [...prev, id];
        handleUpdateAssessment(assessmentId, {
          blooms_classification: updated.map(Number),
        });
        return updated;
      });
    },
    [assessmentId, handleUpdateAssessment]
  );

  const toggleOutcome = useCallback(
    (id: string) => {
      setSelectedOutcomes((prev) => {
        const updated = prev.includes(id)
          ? prev.filter((o) => o !== id)
          : [...prev, id];
        handleUpdateAssessment(assessmentId, {
          course_outcome: updated.map(Number),
        });
        return updated;
      });
    },
    [assessmentId, handleUpdateAssessment]
  );

  const menu = (
    <div
      ref={menuRef}
      className="bg-white rounded-lg border border-[#E9E6E6] p-3 w-64 space-y-4 shadow-sm"
      style={{ position: "fixed", top: y, left: x, zIndex: 99999 }}
    >
      {bloomsOptions.length > 0 && (
        <div>
          <label className="block text-sm mb-1">
            Bloom's Classification
          </label>

          <div className="flex flex-wrap gap-1 overflow-hidden">
            {bloomsOptions.map((b) => {
              const isSelected = selectedBlooms.includes(String(b.id));
              const color =
                BLOOM_COLORS[b.name] ||
                "bg-gray-50 border-[#E9E6E6]";

              return (
                <button
                  key={b.id}
                  onClick={() => toggleBloom(String(b.id))}
                  className={`px-2 py-1 text-xs border rounded-full transition 
                    ${
                      isSelected
                        ? color
                        : "bg-white border-[#E9E6E6]"
                    }
                  `}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {outcomesOptions.length > 0 && (
        <div>
          <label className="block text-sm mb-1">
            Course Outcomes
          </label>

          <div className="overflow-hidden space-y-1">
            {outcomesOptions.map((o) => (
              <label key={o.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedOutcomes.includes(String(o.id))}
                  onChange={() => toggleOutcome(String(o.id))}
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
