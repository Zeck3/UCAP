import { useCallback, useEffect, useState } from "react";
import {
  getCourseOutcomes,
  addCourseOutcome,
  updateCourseOutcome,
  deleteCourseOutcome,
} from "../api/instructorCourseOutcomeApi";
import type { CourseOutcome } from "../types/instructorCourseOutcomeTypes";
import LoadingIcon from "../assets/circle-regular.svg?react";
import PlusIcon from "../assets/plus-solid.svg?react";
import TrashIcon from "../assets/trash-solid.svg?react";
import RotateRight from "../assets/rotate-right-solid-full.svg?react";

interface Props {
  loadedCourseId: number;
  onCourseOutcomesChanged?: () => void;
}

export default function CourseOutcomesTableComponent({
  loadedCourseId,
  onCourseOutcomesChanged,
}: Props) {
  const [outcomes, setOutcomes] = useState<CourseOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const fetchOutcomes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCourseOutcomes(loadedCourseId);
      setOutcomes(data);
    } catch (err) {
      console.error("Failed to fetch outcomes:", err);
    } finally {
      setLoading(false);
    }
  }, [loadedCourseId]);

  useEffect(() => {
    fetchOutcomes();
  }, [fetchOutcomes]);

  const handleAdd = async () => {
    if (!newDescription.trim()) return;
    setAdding(true);
    try {
      const newOutcome = await addCourseOutcome(loadedCourseId, {
        course_outcome_description: newDescription,
      });
      setOutcomes((prev) => [...prev, newOutcome]);
      setNewDescription("");
      onCourseOutcomesChanged?.();
    } catch (err) {
      console.error("Failed to add outcome:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleEditSave = async (id: number, value: string) => {
    if (!value.trim()) return;
    try {
      await updateCourseOutcome(id, { course_outcome_description: value });
      setOutcomes((prev) =>
        prev.map((o) =>
          o.course_outcome_id === id
            ? { ...o, course_outcome_description: value }
            : o
        )
      );
      setEditingId(null);
      onCourseOutcomesChanged?.();
    } catch (err) {
      console.error("Failed to update outcome:", err);
    }
  };

  const handleDelete = async () => {
    try {
      const latest = outcomes[outcomes.length - 1];
      if (latest) {
        const success = await deleteCourseOutcome(latest.course_outcome_id);
        if (success) setOutcomes((prev) => prev.slice(0, prev.length - 1));
      }
      setNewDescription("");
      onCourseOutcomesChanged?.();
    } catch (err) {
      console.error("Failed to delete outcome:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingIcon className="h-8 w-8 animate-spin text-[#ffc000]" />
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
                Course Outcome
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {outcomes.map((o) => (
              <tr
                key={o.course_outcome_id}
                className="border-t border-[#E9E6E6]"
              >
                <td className="px-4 py-3">{o.course_outcome_code}</td>
                <td className="px-4 py-3">
                  {editingId === o.course_outcome_id ? (
                    <input
                      name={`edit_co_${o.course_outcome_id}`}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() =>
                        handleEditSave(o.course_outcome_id, editValue)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && editValue.trim()) {
                          e.preventDefault();
                          handleEditSave(o.course_outcome_id, editValue);
                        }
                      }}
                      className="border border-[#E9E6E6] rounded-md px-2 py-1 w-full"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setEditingId(o.course_outcome_id);
                        setEditValue(o.course_outcome_description);
                      }}
                      className="cursor-pointer hover:underline"
                    >
                      {o.course_outcome_description}
                    </span>
                  )}
                </td>
              </tr>
            ))}

            <tr className="border-t border-[#E9E6E6]">
              <td className="px-4 py-3 text-gray-400 italic">Next CO</td>
              <td className="px-4 py-3">
                <input
                  name="new_course_outcome"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newDescription.trim() && !adding) {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder="Enter new CO description..."
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

      <div className="flex justify-between items-center gap-2">
        <div className="flex flex-row gap-2">
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
              <LoadingIcon className="h-8 w-8 animate-spin text-white" />
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Add
              </>
            )}
          </button>
          <button
            onClick={fetchOutcomes}
            disabled={loading}
            className={`border border-[#E9E6E6] px-4 py-2 rounded-md flex items-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            <RotateRight
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        {outcomes.length !== 0 && (
          <button
            onClick={handleDelete}
            disabled={adding || outcomes.length === 0}
            className={`border border-red-400 text-red-400 hover:text-red-500 px-3 py-2 rounded-md flex items-center gap-2 ${
              adding || outcomes.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title="Delete latest CO"
          >
            <TrashIcon className="h-4 w-4" />
            Delete Latest
          </button>
        )}
      </div>
    </div>
  );
}
