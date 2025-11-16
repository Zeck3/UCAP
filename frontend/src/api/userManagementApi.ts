import axiosClient from "./axiosClient";
import axios from "axios";

import type {
  BackendFieldErrors,
  FacultyInfo,
  FacultyInfoDisplay,
  FacultyPayload,
  UserMutationResult,
} from "../types/userManagementTypes";

function mapUser(user: FacultyInfo): FacultyInfoDisplay {
  return {
    id: user.user_id,
    name: `${user.first_name || ""} ${
      user.middle_name ? user.middle_name + " " : ""
    }${user.last_name || ""}${user.suffix ? ", " + user.suffix : ""}`.trim(),
    email: user.email,
    role: user.user_role_type ?? "N/A",
    department: user.department_name ?? "N/A",
  };
}

export async function getUsers(): Promise<FacultyInfoDisplay[]> {
  try {
    const res = await axiosClient.get<FacultyInfo[]>("/admin/user_management/");
    return res.data.map(mapUser);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUser(id: number): Promise<FacultyInfo | null> {
  try {
    const res = await axiosClient.get<FacultyInfo>(
      `/admin/user_management/${id}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function addUser(
  payload: FacultyPayload
): Promise<UserMutationResult> {
  try {
    const res = await axiosClient.post<FacultyInfo>(
      "/admin/user_management/",
      payload
    );
    return { data: mapUser(res.data) };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      const backendErrors = error.response.data.errors as BackendFieldErrors;
      return { errors: backendErrors };
    }
    throw error;
  }
}

export async function editUser(
  id: number,
  updates: Partial<FacultyPayload>
): Promise<UserMutationResult> {
  try {
    const res = await axiosClient.put<FacultyInfo>(
      `/admin/user_management/${id}`,
      updates
    );
    return { data: mapUser(res.data) };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      const backendErrors = error.response.data.errors as BackendFieldErrors;
      return { errors: backendErrors };
    }
    throw error;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    await axiosClient.delete(`/admin/user_management/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}
