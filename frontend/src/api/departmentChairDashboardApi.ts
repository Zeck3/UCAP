import axiosClient from "./axiosClient";
import type {
  DepartmentLoadedCourses,
  DepartmentLoadedCoursesDisplay,
  LoadDepartmentCourseMessage,
  DepartmentLoadedCourseSections,
  DepartmentLoadedCourseSectionsDisplay,
  CreateSection,
  CreateSectionMessage,
  DepartmentCourses,
  LoadDepartmentCourse,
} from "../types/departmentChairDashboardTypes";

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
): Promise<LoadDepartmentCourseMessage> {
  const response = await axiosClient.post<LoadDepartmentCourseMessage>(
    `department_chair/department_course_management/${departmentId}/`,
    data
  );
  return response.data;
}


export async function deleteLoadedCourse(
  loadedCourseId: number
): Promise<boolean> {
  await axiosClient.delete(
    `department_chair/department_course_management/${loadedCourseId}/`
  );
  return true;
}

export async function getSections(
  loadedCourseId: number
): Promise<DepartmentLoadedCourseSectionsDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourseSections[]>(
    `department_chair/section_management/${loadedCourseId}/`
  );
  return response.data.map((s) => ({
    id: s.section_id,
    year_and_section: s.year_and_section,
    instructor_assigned:
      s.first_name || s.last_name
        ? `${s.first_name ?? ""} ${s.last_name}`.trim()
        : "NO INSTRUCTOR ASSIGNED",
  }));
}

export async function addSection(
  loadedCourseId: number,
  section: CreateSection
): Promise<CreateSectionMessage> {
  const response = await axiosClient.post<CreateSectionMessage>(
    `department_chair/section_management/${loadedCourseId}/`,
    section
  );
  return response.data;
}

export async function editSection(
  sectionId: number,
  updatedSection: Partial<CreateSection>
): Promise<CreateSectionMessage> {
  const response = await axiosClient.put<CreateSectionMessage>(
    `department_chair/section_management/${sectionId}/`,
    updatedSection
  );
  return response.data;
}

export async function deleteSection(sectionId: number): Promise<boolean> {
  await axiosClient.delete(`department_chair/section_management/${sectionId}/`);
  return true;
}
