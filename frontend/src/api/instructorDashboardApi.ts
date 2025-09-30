import axiosClient from "./axiosClient";
import type { InstructorCourse, CourseDetailsWithSections } from "../types/instructorDashboardTypes";

export const InstructorCourses = async (instructorId: number): Promise<InstructorCourse[]> => {
  const response = await axiosClient.get(`instructor/${instructorId}`);
  return response.data;
};

export const fetchCourseDetails = async (instructorId: number, loaded_course_id: number): Promise<CourseDetailsWithSections[]> => {
  const response = await axiosClient.get(`instructor/${instructorId}/${loaded_course_id}`);
  return response.data;
};