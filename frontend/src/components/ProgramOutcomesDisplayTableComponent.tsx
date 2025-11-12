import { useCallback, useEffect, useState } from "react";
import { getProgramOutcomes } from "../api/departmentChairProgramOutcomeApi";
import type { ProgramOutcome } from "../types/departmentChairProgramOutcomeTypes";
import LoadingIcon from "../assets/circle-regular.svg?react";

interface Props {
  programId: number;
}

export default function ProgramOutcomesDisplayTable({ programId }: Props) {
  const [outcomes, setOutcomes] = useState<ProgramOutcome[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutcomes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProgramOutcomes(programId);
      setOutcomes(data);
    } catch (err) {
      console.error("Failed to fetch outcomes:", err);
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchOutcomes();
  }, [fetchOutcomes]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIcon className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (outcomes.length === 0) {
    return (
      <div className="text-center text-gray-600 py-12">
        No Program Outcomes available.
      </div>
    );
  }

  return (
    <div className="border border-[#E9E6E6] rounded-md overflow-hidden">
      <table className="min-w-full border-collapse text-sm text-left">
        <thead className="bg-gray-50 border-b border-[#E9E6E6]">
          <tr>
            <th className="px-4 py-3 w-40 font-medium">
              Program Outcome
            </th>
            <th className="px-4 py-3 font-medium">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {outcomes.map((o) => (
            <tr key={o.program_outcome_id} className="border-t border-[#E9E6E6]">
              <td className="px-4 py-3">{o.program_outcome_code}</td>
              <td className="px-4 py-3">{o.program_outcome_description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
