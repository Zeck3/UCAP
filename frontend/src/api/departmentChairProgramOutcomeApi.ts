import axiosClient from "./axiosClient";
import type { ProgramOutcome } from "../types/departmentChairProgramOutcomeTypes";

export async function getProgramOutcomes(programId: number): Promise<ProgramOutcome[]> {
  const response = await axiosClient.get(
    `/department_chair/program_outcomes_management/${programId}/`
  );
  return response.data;
}

export async function addProgramOutcome(
  programId: number,
  description: string
): Promise<ProgramOutcome> {
  const response = await axiosClient.post(
    `/department_chair/program_outcomes_management/${programId}/`,
    { program_outcome_description: description }
  );
  return response.data.data;
}

export async function editProgramOutcome(
  outcomeId: number,
  description: string
): Promise<ProgramOutcome> {
  const response = await axiosClient.put(
    `/department_chair/program_outcomes_management/detail/${outcomeId}/`,
    { program_outcome_description: description }
  );
  return response.data.data;
}

export async function deleteProgramOutcome(outcomeId: number): Promise<boolean> {
  try {
    await axiosClient.delete(
      `/department_chair/program_outcomes_management/detail/${outcomeId}/`
    );
    return true;
  } catch (error) {
    console.error("Delete failed:", error);
    return false;
  }
}
