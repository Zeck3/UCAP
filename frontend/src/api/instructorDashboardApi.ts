import axiosClient from "./axiosClient";
import type {
  CourseDetailsWithSections,
} from "../types/instructorDashboardTypes";
import type { BaseLoadedCourse } from "../types/baseTypes";

export const InstructorCourses = async (
  instructorId: number
): Promise<BaseLoadedCourse[]> => {
  const response = await axiosClient.get(`/instructor/${instructorId}`);
  return response.data;
};

export const fetchCourseDetails = async (
  instructorId: number,
  loaded_course_id: number
): Promise<CourseDetailsWithSections> => {
  const response = await axiosClient.get(
    `/instructor/${instructorId}/${loaded_course_id}`
  );
  return response.data;
};
