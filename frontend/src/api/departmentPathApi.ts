import axiosClient from "./axiosClient";
import type { DepartmentPathTypes } from "../types/departmentChairDashboardTypes";

export const fetchDepartmentPathSections = async (departmentId: number): Promise<DepartmentPathTypes[]> => {
  const response = await axiosClient.get(`department_chair/${departmentId}`);
  console.log(response.data);
  return response.data;
}
