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

export async function getCourses(departmentId: number): Promise<CourseInfoDisplay[]> {
  try {
    const res = await axiosClient.get<CourseInfo[]>(
      `/department_chair/course_management/${departmentId}/`
    );
    return res.data.map(mapCourse);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error fetching courses:", err);
    return [];
  }
}

export async function getCourse(
  departmentId: number,
  course_code: string
): Promise<CourseInfo | null> {
  try {
    const res = await axiosClient.get<CourseInfo>(
      `/department_chair/course_management/${departmentId}/${course_code}`
    );
    return res.data;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error fetching course:", err);
    return null;
  }
}

export async function addCourse(
  departmentId: number,
  payload: CoursePayload
): Promise<CourseInfoDisplay> {
  try {
    const res = await axiosClient.post<CourseInfo>(
      `/department_chair/course_management/${departmentId}/`,
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
  departmentId: number,
  course_code: string,
  updates: Partial<CoursePayload>
): Promise<CourseInfoDisplay> {
  try {
    const res = await axiosClient.put<CourseInfo>(
      `/department_chair/course_management/${departmentId}/${course_code}`,
      updates
    );
    return mapCourse(res.data);
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error editing course:", err);
    throw err.response?.data || { message: err.message };
  }
}

export async function deleteCourse(
  departmentId: number,
  course_code: string
): Promise<boolean> {
  try {
    await axiosClient.delete(
      `/department_chair/course_management/${departmentId}/${course_code}`
    );
    return true;
  } catch (error) {
    const err = error as AxiosError<{ message?: string }>;
    console.error("Error deleting course:", err);
    return false;
  }
}
