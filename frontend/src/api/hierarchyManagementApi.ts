import axiosClient from "./axiosClient";
import type { College, Department, Program } from "../types/dropdownTypes";

export type CreateCollegePayload = {
  college_name: string;
  campus?: number;
};

export type UpdateCollegePayload = Partial<CreateCollegePayload>;

export async function getColleges(): Promise<College[]> {
  try {
    const res = await axiosClient.get<College[]>("/admin/college/");
    return res.data;
  } catch (error) {
    console.error("Error fetching colleges:", error);
    return [];
  }
}
export async function addCollege(
  payload: CreateCollegePayload
): Promise<College> {
  try {
    const res = await axiosClient.post<College>("/admin/college/", payload);
    return res.data;
  } catch (error) {
    console.error("Error adding college:", error);
    throw error;
  }
}

export async function editCollege(
  collegeId: number,
  payload: UpdateCollegePayload
): Promise<College> {
  try {
    const res = await axiosClient.patch<College>(
      `/admin/college/${collegeId}/`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Error editing college:", error);
    throw error;
  }
}

export async function deleteCollege(collegeId: number): Promise<void> {
  try {
    await axiosClient.delete(`/admin/college/${collegeId}/`);
  } catch (error) {
    console.error("Error deleting college:", error);
    throw error;
  }
}

export type CreateDepartmentPayload = {
  department_name: string;
  campus?: number;
  college?: number | null;
};

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

export async function getDepartments(): Promise<Department[]> {
  try {
    const res = await axiosClient.get<Department[]>("/admin/department/");
    return res.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}
export async function addDepartment(
  payload: CreateDepartmentPayload
): Promise<Department> {
  try {
    const res = await axiosClient.post<Department>(
      "/admin/department/",
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Error adding department:", error);
    throw error;
  }
}

export async function editDepartment(
  departmentId: number,
  payload: UpdateDepartmentPayload
): Promise<Department> {
  try {
    const res = await axiosClient.patch<Department>(
      `/admin/department/${departmentId}/`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Error editing department:", error);
    throw error;
  }
}

export async function deleteDepartment(departmentId: number): Promise<void> {
  try {
    await axiosClient.delete(`/admin/department/${departmentId}/`);
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
}

export type CreateProgramPayload = {
  program_name: string;
  department: number;
};

export type UpdateProgramPayload = Partial<CreateProgramPayload>;

export async function getPrograms(): Promise<Program[]> {
  try {
    const res = await axiosClient.get<Program[]>("/admin/program/");
    return res.data;
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

export async function addProgram(
  payload: CreateProgramPayload
): Promise<Program> {
  try {
    const res = await axiosClient.post<Program>("/admin/program/", payload);
    return res.data;
  } catch (error) {
    console.error("Error adding program:", error);
    throw error;
  }
}

export async function editProgram(
  programId: number,
  payload: UpdateProgramPayload
): Promise<Program> {
  try {
    const res = await axiosClient.patch<Program>(
      `/admin/program/${programId}/`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Error editing program:", error);
    throw error;
  }
}

export async function deleteProgram(programId: number): Promise<void> {
  try {
    await axiosClient.delete(`/admin/program/${programId}/`);
  } catch (error) {
    console.error("Error deleting program:", error);
    throw error;
  }
}
