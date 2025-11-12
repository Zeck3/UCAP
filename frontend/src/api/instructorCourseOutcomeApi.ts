import type { CourseOutcome } from "../types/instructorCourseOutcomeTypes";
import axiosClient from "./axiosClient";

export const getCourseOutcomes = async (loadedCourseId: number): Promise<CourseOutcome[]> => {
  const response = await axiosClient.get(
    `/instructor/course_outcomes_management/${loadedCourseId}/`
  );
  return response.data;
};

export const addCourseOutcome = async (
  loadedCourseId: number,
  payload: { course_outcome_description: string }
): Promise<CourseOutcome> => {
  const response = await axiosClient.post(
    `/instructor/course_outcomes_management/${loadedCourseId}/`,
    payload
  );
  return response.data.data;
};

export const updateCourseOutcome = async (
  outcomeId: number,
  payload: { course_outcome_description: string }
): Promise<CourseOutcome> => {
  const response = await axiosClient.put(
    `/instructor/course_outcomes_management/detail/${outcomeId}/`,
    payload
  );
  return response.data.data;
};

export const deleteCourseOutcome = async (outcomeId: number): Promise<boolean> => {
  try {
    await axiosClient.delete(
      `/instructor/course_outcomes_management/detail/${outcomeId}/`
    );
    return true;
  } catch (error) {
    console.error("Error deleting course outcome:", error);
    return false;
  }
};
