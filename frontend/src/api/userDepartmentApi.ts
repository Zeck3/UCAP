import axiosClient from "./axiosClient";
import type { UserDepartment } from "../types/departmentChairDashboardTypes";

export const fetchUserDepartment = async (departmentId: number): Promise<UserDepartment> => {
  const response = await axiosClient.get(`user/${departmentId}`);
  console.log(response.data);
  return response.data;
}
