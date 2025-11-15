import axiosClient from "./axiosClient";
import type {
  DepartmentCourses,
  LoadDepartmentCourse,
} from "../types/departmentChairLoadedCourseTypes";
import type { BaseLoadedCourse } from "../types/baseTypes";

export async function getDepartmentCourses(
  departmentId: number
): Promise<DepartmentCourses[]> {
  const response = await axiosClient.get<DepartmentCourses[]>(
    `department_chair/department_course_list/${departmentId}/`
  );
  return response.data;
}

export async function getDepartmentLoadedCourses(
  departmentId: number
): Promise<BaseLoadedCourse[]> {
  const response = await axiosClient.get<BaseLoadedCourse[]>(
    `department_chair/department_course_management/${departmentId}/`
  );

  return response.data.map((course) => ({
    ...course,
    id: course.loaded_course_id,
    academic_year_and_semester: `${course.academic_year_start}-${course.academic_year_end} / ${course.semester_type}`,
  }));
}

export async function addLoadedCourse(
  departmentId: number,
  data: LoadDepartmentCourse
): Promise<void> {
  const response = await axiosClient.post(
    `department_chair/department_course_management/${departmentId}/`,
    data
  );
  return response.data;
}

export async function deleteLoadedCourse(
  loadedCourseId: number
): Promise<boolean> {
  await axiosClient.delete(
    `department_chair/department_course_management/delete/${loadedCourseId}/`
  );
  return true;
}
