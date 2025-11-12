import { useCallback, useEffect, useState } from "react";
import {
  getOutcomeMappings,
  updateOutcomeMapping,
} from "../api/OutcomeMappingApi";
import LoadingIcon from "../assets/circle-regular.svg?react";
import type { OutcomeMappingResponse } from "../types/outcomeMappingTypes";

interface Props {
  loadedCourseId: number;
}

export default function OutcomeMappingTableComponent({
  loadedCourseId,
}: Props) {
  const [data, setData] = useState<OutcomeMappingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingCell, setUpdatingCell] = useState<number | null>(null);

  const fetchMappings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOutcomeMappings(loadedCourseId);
      setData(res);
    } catch (err) {
      console.error("Failed to fetch outcome mappings:", err);
    } finally {
      setLoading(false);
    }
  }, [loadedCourseId]);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  const handleCellChange = async (mappingId: number, newValue: string) => {
    if (!["", "I", "D", "E"].includes(newValue.toUpperCase())) return;

    setUpdatingCell(mappingId);
    try {
      await updateOutcomeMapping(mappingId, newValue.toUpperCase());
      setData((prev) => {
        if (!prev) return prev;
        const updated = structuredClone(prev);
        const cell = updated.mapping.find((m) => m.id === mappingId);
        if (cell) cell.outcome_mapping = newValue.toUpperCase();
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
        <LoadingIcon className="h-6 w-6 animate-spin" />
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

  return (
    <div className="overflow-x-auto border border-[#E9E6E6] rounded-md">
      <table className="min-w-full border-collapse text-sm text-center w-full">
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
          {sortedCourseOutcomes.map((co) => (
            <tr
              key={co.course_outcome_id}
              className="border-t border-[#E9E6E6]"
            >
              <td className="px-4 py-2 text-left font-medium w-56">
                {co.course_outcome_code}
              </td>

              {sortedProgramOutcomes.map((po) => {
                const value = getMappingValue(
                  co.course_outcome_id,
                  po.program_outcome_id
                );
                const currentId = getMappingId(
                  co.course_outcome_id,
                  po.program_outcome_id
                );

                return (
                  <td key={po.program_outcome_id} className="">
                    <input
                      type="text"
                      value={value}
                      maxLength={1}
                      onChange={(e) => {
                        const newVal = e.target.value.toUpperCase();
                        // Accept only I, D, E, or blank
                        if (["", "I", "D", "E"].includes(newVal)) {
                          // Update the data locally without triggering backend
                          const updated = { ...data };
                          const cell = updated.mapping.find(
                            (m) =>
                              m.course_outcome.course_outcome_id ===
                                co.course_outcome_id &&
                              m.program_outcome.program_outcome_id ===
                                po.program_outcome_id
                          );
                          if (cell) cell.outcome_mapping = newVal;
                          setData(updated);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && currentId) {
                          const newVal = e.currentTarget.value.toUpperCase();
                          if (["", "I", "D", "E"].includes(newVal)) {
                            handleCellChange(currentId, newVal);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (currentId) {
                          const newVal = e.currentTarget.value.toUpperCase();
                          if (["", "I", "D", "E"].includes(newVal)) {
                            handleCellChange(currentId, newVal);
                          }
                        }
                      }}
                      disabled={updatingCell === currentId}
                      className={`text-center w-full h-12 ${
                        updatingCell === currentId
                          ? "bg-gray-100 cursor-wait"
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
  );
}
