import { useCallback, useEffect, useState } from "react";
import {
  getProgramOutcomes,
  addProgramOutcome,
  editProgramOutcome,
  deleteProgramOutcome,
} from "../api/departmentChairProgramOutcomeApi";
import type { ProgramOutcome } from "../types/departmentChairProgramOutcomeTypes";
import LoadingIcon from "../assets/circle-regular.svg?react";
import PlusIcon from "../assets/plus-solid.svg?react";
import TrashIcon from "../assets/trash-solid.svg?react";

interface Props {
  programId: number;
}

export default function ProgramOutcomesTableComponent({ programId }: Props) {
  const [outcomes, setOutcomes] = useState<ProgramOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newDescription, setNewDescription] = useState("");

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

  const handleAdd = async () => {
    if (!newDescription.trim()) return;
    setAdding(true);
    try {
      const newOutcome = await addProgramOutcome(programId, newDescription);
      setOutcomes((prev) => [...prev, newOutcome]);
      setNewDescription("");
    } catch (err) {
      console.error("Failed to add outcome:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleEditSave = async (id: number, value: string) => {
    if (!value.trim()) return;
    try {
      await editProgramOutcome(id, value);
      setOutcomes((prev) =>
        prev.map((o) =>
          o.program_outcome_id === id
            ? { ...o, program_outcome_description: value }
            : o
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update outcome:", err);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete latest Program Outcome?");
    if (!confirmed) return;
    try {
      const latest = outcomes[outcomes.length - 1];
      if (latest) {
        const success = await deleteProgramOutcome(latest.program_outcome_id);
        if (success) setOutcomes((prev) => prev.slice(0, prev.length - 1)); // remove locally
      }
    } catch (err) {
      console.error("Failed to delete outcome:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIcon className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-[#E9E6E6] rounded-md">
        <table className="min-w-full rounded-md text-sm text-left border-collapse">
          <thead className="border-b border-[#E9E6E6] bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-40 font-medium text-gray-700">
                Program Outcome
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr
                key={o.program_outcome_id}
                className="border-t border-[#E9E6E6]"
              >
                <td className="px-4 py-3">{o.program_outcome_code}</td>
                <td className="px-4 py-3">
                  {editingId === o.program_outcome_id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() =>
                        handleEditSave(o.program_outcome_id, editValue)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editValue.trim()) {
                          e.preventDefault();
                          handleEditSave(o.program_outcome_id, editValue);
                        }
                      }}
                      className="border border-[#E9E6E6] rounded-md px-2 py-1 w-full"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setEditingId(o.program_outcome_id);
                        setEditValue(o.program_outcome_description);
                      }}
                      className="cursor-pointer hover:underline"
                    >
                      {o.program_outcome_description}
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {/* Input row for next PO */}
            <tr className="border-t border-[#E9E6E6]">
              <td className="px-4 py-3 text-gray-400 italic">Next PO</td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newDescription.trim() && !adding) {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder="Enter new PO description..."
                  disabled={adding}
                  className={`border border-[#E9E6E6] rounded-md px-2 py-1 w-full ${
                    adding ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-2">
        {outcomes.length !== 0 && (
          <button
            onClick={handleDelete}
            disabled={adding || outcomes.length === 0}
            className={`border border-red-400 text-red-400 hover:text-red-500 px-3 py-2 rounded-md flex items-center gap-2 ${
              adding || outcomes.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="Delete latest PO"
          >
            <TrashIcon className="h-4 w-4" />
            Delete Latest
          </button>
        )}

        <button
          onClick={handleAdd}
          disabled={!newDescription.trim() || adding}
          className={`bg-ucap-yellow text-white px-4 py-2 rounded-md flex items-center gap-2 ${
            !newDescription.trim() || adding
              ? "opacity-50 cursor-not-allowed"
              : "bg-ucap-yellow-hover"
          }`}
        >
          {adding ? (
            <LoadingIcon className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}
