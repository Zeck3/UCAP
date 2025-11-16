import { useCallback, useEffect, useState } from "react";
import { getProgramOutcomes } from "../api/departmentChairProgramOutcomeApi";
import type { ProgramOutcome } from "../types/departmentChairProgramOutcomeTypes";
import LoadingIcon from "../assets/circle-regular.svg?react";
import RotateRight from "../assets/rotate-right-solid-full.svg?react";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-[#E9E6E6] rounded-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingIcon className="h-8 w-8 animate-spin text-[#ffc000]" />
          </div>
        ) : outcomes.length === 0 ? (
          <div className="text-center text-gray-600 py-12">
            No Program Outcomes available.
          </div>
        ) : (
          <table className="min-w-full border-collapse text-sm text-left">
            <thead className="bg-gray-50 border-b border-[#E9E6E6]">
              <tr>
                <th className="px-4 py-3 w-40 font-medium">Program Outcome</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map((o) => (
                <tr
                  key={o.program_outcome_id}
                  className="border-t border-[#E9E6E6]"
                >
                  <td className="px-4 py-3">{o.program_outcome_code}</td>
                  <td className="px-4 py-3">{o.program_outcome_description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <button
          onClick={fetchOutcomes}
          disabled={loading}
          className={`border border-[#E9E6E6] px-4 py-2 rounded-md flex items-center gap-2 ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50"
          }`}
        >
          <RotateRight className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    </div>
  );
}
