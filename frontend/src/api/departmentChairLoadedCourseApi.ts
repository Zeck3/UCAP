import axiosClient from "./axiosClient";
import type {
  DepartmentLoadedCourses,
  DepartmentLoadedCoursesDisplay,
  DepartmentCourses,
  LoadDepartmentCourse,
} from "../types/departmentChairLoadedCourseTypes";

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
): Promise<DepartmentLoadedCoursesDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourses[]>(
    `department_chair/department_course_management/${departmentId}/`
  );
  return response.data.map((course) => ({
    id: course.loaded_course_id,
    course_code: course.course_code,
    course_title: course.course_title,
    program_name: course.program_name,
    year_level: course.year_level_type,
    semester_type: course.semester_type,
    academic_year: `${course.academic_year_start}-${course.academic_year_end}`,
    academicYearAndSem: `${course.academic_year_start}-${course.academic_year_end} ${course.semester_type}`,
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
