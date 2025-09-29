import type { AxiosError } from "axios";
import axiosClient from "./axiosClient";
import type {
  CourseInfoDisplay,
  CourseInfo,
  CoursePayload,
} from "../types/courseManagementTypes";

export function mapCourse(course: CourseInfo): CourseInfoDisplay {
  return {
    id: String(course.course_code),
    course_code: course.course_code,
    course_title: course.course_title,
    program_name: course.program_name,
    year_level_type: course.year_level_type,
    semester_type: course.semester_type,
  };
}

export async function getCourses(): Promise<CourseInfoDisplay[]> {
  try {
    const res = await axiosClient.get<CourseInfo[]>(
      "/admin/course_management/"
    );
    return res.data.map(mapCourse);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error fetching courses:", err);
    return [];
  }
}

export async function getCourse(
  course_code: string
): Promise<CourseInfo | null> {
  try {
    const res = await axiosClient.get<CourseInfo>(
      `/admin/course_management/${course_code}`
    );
    return res.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error fetching course:", err);
    return null;
  }
}

export async function addCourse(
  payload: CoursePayload
): Promise<CourseInfoDisplay> {
  try {
    const res = await axiosClient.post<CourseInfo>(
      "/admin/course_management/",
      payload
    );
    return mapCourse(res.data);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error adding course:", err);
    throw err.response?.data || { message: err.message };
  }
}

export async function editCourse(
  course_code: string,
  updates: Partial<CoursePayload>
): Promise<CourseInfoDisplay> {
  try {
    const payload = {
      ...updates,
    };
    const res = await axiosClient.put<CourseInfo>(
      `/admin/course_management/${course_code}`,
      payload
    );
    return mapCourse(res.data);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error editing course:", err);
    throw err.response?.data || { message: err.message };
  }
}

export async function deleteCourse(course_code: string): Promise<boolean> {
  try {
    await axiosClient.delete(`/admin/course_management/${course_code}`);
    return true;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error deleting course:", err);
    return false;
  }
}
