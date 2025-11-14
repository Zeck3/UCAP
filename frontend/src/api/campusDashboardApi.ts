// src/api/vcaaDashboardApi.ts
import axiosClient from "./axiosClient";
import type { CampusCourseDetails, CampusCoursePageResponse } from "../types/campusLoadedCourseTypes"

export const fetchCampusLoadedCourses = async (
  campusId: number
): Promise<CampusCourseDetails[]> => {
  const res = await axiosClient.get(`/campus/${campusId}/`);
  return res.data;
};

export const fetchCampusCoursePage = async (
  loadedCourseId: number
): Promise<CampusCoursePageResponse> => {
  const res = await axiosClient.get(
    `/campus/loaded_course/${loadedCourseId}/`
  );
  return res.data;
};
