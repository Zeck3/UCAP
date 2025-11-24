import { useCallback, useEffect, useRef, useState } from "react";
import {
  getOutcomeMappings,
  updateOutcomeMapping,
} from "../api/outcomeMappingApi";
import LoadingIcon from "../assets/circle-regular.svg?react";
import type { OutcomeMappingResponse } from "../types/outcomeMappingTypes";
import RotateRight from "../assets/rotate-right-solid-full.svg?react";

interface Props {
  loadedCourseId: number;
}

export default function OutcomeMappingTableComponent({
  loadedCourseId,
}: Props) {
  const [data, setData] = useState<OutcomeMappingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingCell, setUpdatingCell] = useState<number | null>(null);

  const tableRef = useRef<HTMLDivElement | null>(null);
  const activeEditIdsRef = useRef<Set<number> | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedCellIds, setSelectedCellIds] = useState<Set<number>>(
    () => new Set()
  );

  const fetchMappings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOutcomeMappings(loadedCourseId);
      setData(res);
      setSelectedCellIds(new Set());
      setSelectionStart(null);
    } catch (err) {
      console.error("Failed to fetch outcome mappings:", err);
    } finally {
      setLoading(false);
    }
  }, [loadedCourseId]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    const handleMouseUp = () => setIsSelecting(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!tableRef.current) return;
      if (!tableRef.current.contains(e.target as Node)) {
        setSelectedCellIds(new Set());
        setSelectionStart(null);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const handleCellChange = async (mappingId: number, newValue: string) => {
    const upper = newValue.toUpperCase();
    if (!["", "I", "D", "E"].includes(upper)) return;

    setUpdatingCell(mappingId);
    try {
      await updateOutcomeMapping(mappingId, upper);
      setData((prev) => {
        if (!prev) return prev;
        const updated = structuredClone(prev);
        const cell = updated.mapping.find((m) => m.id === mappingId);
        if (cell) cell.outcome_mapping = upper;
        return updated;
      });
    } catch (err) {
      console.error("Failed to update mapping:", err);
    } finally {
      setUpdatingCell(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIcon className="h-8 w-8 animate-spin text-[#ffc000]" />
      </div>
    );
  }

  const { program_outcomes, course_outcomes, mapping } = data;

  const sortedProgramOutcomes = [...program_outcomes].sort((a, b) => {
    const letterA = a.program_outcome_code.replace("PO-", "").toLowerCase();
    const letterB = b.program_outcome_code.replace("PO-", "").toLowerCase();
    return letterA.localeCompare(letterB);
  });

  const sortedCourseOutcomes = [...course_outcomes].sort((a, b) => {
    const numA = parseInt(a.course_outcome_code.replace("CO", ""), 10);
    const numB = parseInt(b.course_outcome_code.replace("CO", ""), 10);
    return numA - numB;
  });

  const getMappingValue = (coId: number, poId: number): string => {
    const found = mapping.find(
      (m) =>
        m.course_outcome.course_outcome_id === coId &&
        m.program_outcome.program_outcome_id === poId
    );
    return found?.outcome_mapping ?? "";
  };

  const getMappingId = (coId: number, poId: number): number | undefined => {
    const found = mapping.find(
      (m) =>
        m.course_outcome.course_outcome_id === coId &&
        m.program_outcome.program_outcome_id === poId
    );
    return found?.id;
  };

  const updateSelectionRange = (row: number, col: number) => {
    if (!selectionStart) return;

    const rowStart = Math.min(selectionStart.row, row);
    const rowEnd = Math.max(selectionStart.row, row);
    const colStart = Math.min(selectionStart.col, col);
    const colEnd = Math.max(selectionStart.col, col);

    const newSelected = new Set<number>();

    for (let r = rowStart; r <= rowEnd; r++) {
      const co = sortedCourseOutcomes[r];
      if (!co) continue;
      for (let c = colStart; c <= colEnd; c++) {
        const po = sortedProgramOutcomes[c];
        if (!po) continue;
        const id = getMappingId(co.course_outcome_id, po.program_outcome_id);
        if (id != null) newSelected.add(id);
      }
    }

    setSelectedCellIds(newSelected);

    if (activeEditIdsRef.current) {
      activeEditIdsRef.current = new Set(newSelected);
    }
  };

  if (!data) {
    return (
      <div className="text-center text-[#3E3E3E] py-12">
        Failed to load CO-PO mapping.
      </div>
    );
  }

  const noCOs = sortedCourseOutcomes.length === 0;
  const noPOs = sortedProgramOutcomes.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {noCOs && noPOs ? (
        <div className="text-center text-[#767676] py-12 border border-[#E9E6E6] rounded-md">
          No Course Outcome to Program Outcome mappings available.
        </div>
      ) : noCOs && !noPOs ? (
        <div className="overflow-x-auto border border-[#E9E6E6] rounded-md">
          <table className="min-w-full border-collapse text-sm text-center w-full">
            <thead className="border-b border-[#E9E6E6] bg-gray-50">
              <tr>
                <th
                  colSpan={sortedProgramOutcomes.length}
                  className="px-4 py-3 text-center font-medium border-b border-[#E9E6E6]"
                >
                  Program Outcomes (PO)
                </th>
              </tr>
              <tr>
                {sortedProgramOutcomes.map((po) => (
                  <th
                    key={po.program_outcome_id}
                    className="px-2 py-3 border-l border-[#E9E6E6] first:border-l-0 font-medium"
                  >
                    {po.program_outcome_code.replace("PO-", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={sortedProgramOutcomes.length}
                  className="py-6 text-[#767676]"
                >
                  No Course Outcomes available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : !noCOs && noPOs ? (
        <div
          ref={tableRef}
          className="overflow-x-auto border border-[#E9E6E6] rounded-md"
        >
          <table className="min-w-full border-collapse text-sm text-center w-full">
            <thead className="border-b border-[#E9E6E6] bg-gray-50">
              <tr>
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left align-middle border-r border-[#E9E6E6] w-56 font-medium"
                >
                  Course Outcomes (CO)
                </th>
                <th className="px-4 py-3 text-center border-b border-[#E9E6E6] font-medium">
                  Program Outcomes (PO)
                </th>
              </tr>
              <tr>
                <th className="px-2 py-3 text-[#767676] font-normal">
                  No Program Outcomes available.
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCourseOutcomes.map((co) => (
                <tr
                  key={co.course_outcome_id}
                  className="border-t border-[#E9E6E6]"
                >
                  <td className="px-4 py-3 text-left font-medium w-56">
                    {co.course_outcome_code}
                  </td>
                  <td className="px-4 py-3 text-[#3E3E3E] italic">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={tableRef}
          className="overflow-x-auto border border-[#E9E6E6] rounded-md"
        >
          <table className="min-w-full border-collapse text-sm text-center w-full select-none">
            <thead className="border-b border-[#E9E6E6] bg-gray-50">
              <tr>
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left align-middle border-r border-[#E9E6E6] w-56 font-medium"
                >
                  Course Outcomes (CO)
                </th>
                <th
                  colSpan={sortedProgramOutcomes.length}
                  className="px-4 py-3 text-center border-b border-[#E9E6E6] font-medium"
                >
                  Program Outcomes (PO)
                </th>
              </tr>
              <tr>
                {sortedProgramOutcomes.map((po) => (
                  <th
                    key={po.program_outcome_id}
                    className="px-2 py-3 border-l border-[#E9E6E6] font-medium w-auto"
                  >
                    {po.program_outcome_code.replace("PO-", "")}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedCourseOutcomes.map((co, rowIndex) => (
                <tr
                  key={co.course_outcome_id}
                  className="border-t border-[#E9E6E6]"
                >
                  <td className="px-4 py-2 text-left font-medium w-56">
                    {co.course_outcome_code}
                  </td>

                  {sortedProgramOutcomes.map((po, colIndex) => {
                    const value = getMappingValue(
                      co.course_outcome_id,
                      po.program_outcome_id
                    );
                    const currentId = getMappingId(
                      co.course_outcome_id,
                      po.program_outcome_id
                    );
                    const isSelected =
                      currentId != null && selectedCellIds.has(currentId);

                    return (
                      <td
                        key={po.program_outcome_id}
                        onMouseDown={(e) => {
                          if (e.button !== 0) return;
                          if (!currentId) return;
                          setIsSelecting(true);
                          setSelectionStart({ row: rowIndex, col: colIndex });
                          const initial = new Set<number>();
                          initial.add(currentId);
                          setSelectedCellIds(initial);
                        }}
                        onMouseEnter={() => {
                          if (!isSelecting) return;
                          updateSelectionRange(rowIndex, colIndex);
                        }}
                        className={`p-0 ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        <input
                          name={`mapping_${co.course_outcome_id}_${po.program_outcome_id}`}
                          type="text"
                          value={value}
                          maxLength={1}
                          readOnly
                          onFocus={() => {
                            if (!currentId) return;
                            const snapshot =
                              selectedCellIds.size > 0 &&
                              selectedCellIds.has(currentId)
                                ? new Set(selectedCellIds)
                                : new Set<number>([currentId]);
                            activeEditIdsRef.current = snapshot;
                            setSelectedCellIds(snapshot);
                          }}
                          onKeyDown={(e) => {
                            if (!currentId) return;

                            const key = e.key;
                            const upper = key.toUpperCase();
                            const isAllowedChar = ["I", "D", "E"].includes(
                              upper
                            );
                            const isErase =
                              key === "Backspace" || key === "Delete";

                            if (isAllowedChar || isErase) {
                              e.preventDefault();

                              const snapshot =
                                activeEditIdsRef.current ??
                                new Set<number>([currentId]);

                              const newVal = isErase ? "" : upper;

                              setData((prev) => {
                                if (!prev) return prev;
                                const updated = structuredClone(prev);
                                updated.mapping.forEach((m) => {
                                  if (snapshot.has(m.id)) {
                                    m.outcome_mapping = newVal;
                                  }
                                });
                                return updated;
                              });
                            }
                          }}
                          onBlur={(e) => {
                            if (!currentId) return;
                            const newVal = e.currentTarget.value.toUpperCase();
                            if (!["", "I", "D", "E"].includes(newVal)) return;

                            const snapshot =
                              activeEditIdsRef.current ??
                              new Set<number>([currentId]);

                            snapshot.forEach((id) => {
                              void handleCellChange(id, newVal);
                            });

                            activeEditIdsRef.current = null;
                          }}
                          disabled={updatingCell === currentId}
                          className={`text-center w-full h-12 outline-none cursor-text ${
                            updatingCell === currentId
                              ? ""
                              : isSelected
                              ? "bg-blue-50"
                              : "bg-white"
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={fetchMappings}
          disabled={loading}
          className={`border border-[#E9E6E6] px-4 py-2 rounded-md flex items-center gap-2 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
          }`}
        >
          <RotateRight className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
