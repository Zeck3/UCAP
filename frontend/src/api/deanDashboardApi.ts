import type { DeanCoursePageResponse, DeanLoadedCourse } from "../types/deanDashboardTypes";
import axiosClient from "./axiosClient";

export const fetchDeanLoadedCourses = async (
  departmentId: number
): Promise<DeanLoadedCourse[]> => {
  const response = await axiosClient.get(`/dean/${departmentId}/`);
  return response.data;
};

export const fetchDeanCoursePage = async (
  loadedCourseId: number
): Promise<DeanCoursePageResponse> => {
  const res = await axiosClient.get(`/dean/loaded_course/${loadedCourseId}/`);
  return res.data;
};