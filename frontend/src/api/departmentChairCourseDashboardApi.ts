import axiosClient from "./axiosClient";
import type { DepartmentDetail, DepartmentLoadedCourses, DepartmentLoadedCoursesDisplay, DepartmentCourses, DepartmentCoursesDisplay, LoadDepartmentCourse, LoadDepartmentCourseMessage } from "../types/departmentChairDashboardTypes";

function mapDepartmentLoadedCourses(loaded_course: DepartmentLoadedCourses): DepartmentLoadedCoursesDisplay {
  return {
    id: loaded_course.loaded_course_id,
    course_code: loaded_course.course_code,
    course_title: loaded_course.course_title,
    program_name: loaded_course.program_name,
    year_level: loaded_course.year_level,
    semester_type: loaded_course.semester_type,
    department_name: loaded_course.department_name,
    academic_year: `${loaded_course.academic_year_start}-${loaded_course.academic_year_end}`,
    academicYearAndSem: `${loaded_course.academic_year_start}-${loaded_course.academic_year_end} ${loaded_course.semester_type}`,
  };
}

function mapDepartmentCourses(course: DepartmentCourses): DepartmentCoursesDisplay {
  return {
    id: course.course_code,
    course_title: course.course_title,
    lecture_unit: course.lecture_unit,
    lab_unit: course.lab_unit,
    credit_unit: course.credit_unit
  }

}

export async function fetchLoadDepartmentCourse(load_department_course: LoadDepartmentCourse): Promise<LoadDepartmentCourseMessage> {
  const response = await axiosClient.post<LoadDepartmentCourseMessage>(`department_chair/load_department_course/`, load_department_course);
  return response.data;
}

export async function fetchDepartmentDetails(departmentId: number): Promise<DepartmentDetail[]> {
  const response = await axiosClient.get<DepartmentDetail[]>(`department_chair/department_details/${departmentId}/`);
  return response.data;
};

export async function fetchDepartmentLoadedCourses(departmentId: number): Promise<DepartmentLoadedCoursesDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourses[]>(`department_chair/course_management/${departmentId}/`);
  return response.data.map(mapDepartmentLoadedCourses);
};

export async function fetchDepartmentCourses(departmentId: number): Promise<DepartmentCoursesDisplay[]> {
  const response = await axiosClient.get<DepartmentCourses[]>(`department_chair/not_loaded_courses/${departmentId}/`);
  return response.data.map(mapDepartmentCourses);
};

export async function fetchDeleteCourse(sectionId: number): Promise<boolean> {
  await axiosClient.delete(`department_chair/section/${sectionId}`);
  return true;
}
