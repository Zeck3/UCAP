import { useMemo } from "react";
import type { OutcomeMappingResponse } from "../types/outcomeMappingTypes";

interface Props {
  data: OutcomeMappingResponse | null;
}

export default function OutcomeMappingPredictionTable({ data }: Props) {
  // Always define hooks first
  const sortedProgramOutcomes = useMemo(() => {
    if (!data?.program_outcomes) return [];
    return [...data.program_outcomes].sort((a, b) =>
      a.program_outcome_code.localeCompare(b.program_outcome_code)
    );
  }, [data]);

  const sortedCourseOutcomes = useMemo(() => {
    if (!data?.course_outcomes) return [];
    return [...data.course_outcomes].sort((a, b) => {
      const numA = parseInt(a.course_outcome_code.replace("CO", ""), 10);
      const numB = parseInt(b.course_outcome_code.replace("CO", ""), 10);
      return numA - numB;
    });
  }, [data]);

  if (!data) {
    return (
      <div className="flex justify-center items-center py-12 text-[#3E3E3E]">
        No mapping data available
      </div>
    );
  }

  const { mapping } = data;

  const getMappingValue = (coId: number, poId: number): number => {
    const found = mapping.find(
      (m) =>
        m.course_outcome.course_outcome_id === coId &&
        m.program_outcome.program_outcome_id === poId
    );
    return Number(found?.outcome_mapping) === 1 ? 1 : 0;
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
                return (
                  <td
                    key={po.program_outcome_id}
                    className={`px-2 py-2 text-center border-l border-[#E9E6E6] ${
                      value === 1 ? "bg-green-300 text-white font-semibold" : ""
                    }`}
                  >
                    {value}
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
