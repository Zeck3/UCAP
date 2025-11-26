import axiosClient from "./axiosClient";
import type { BaseLoadedCourse, BaseCoursePageResponse } from "../types/baseTypes";

export const InstructorCourses = async (
  instructorId: number
): Promise<BaseLoadedCourse[]> => {
  const response = await axiosClient.get(`/instructor/${instructorId}/`);
  return response.data;
};

export const fetchCourseDetails = async (
  instructorId: number,
  loaded_course_id: number
): Promise<BaseCoursePageResponse> => {
  const response = await axiosClient.get(
    `/instructor/${instructorId}/${loaded_course_id}`
  );
  return response.data;
};
