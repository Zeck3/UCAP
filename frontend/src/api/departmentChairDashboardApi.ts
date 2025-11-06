import axiosClient from "./axiosClient";
import type {
  DepartmentDetail,
  DepartmentLoadedCourses,
  DepartmentLoadedCoursesDisplay,
  LoadDepartmentCourseMessage,
  DepartmentLoadedCourseDetails,
  DepartmentLoadedCourseDetailsDisplay,
  DepartmentLoadedCourseSections,
  DepartmentLoadedCourseSectionsDisplay,
  CreateSection,
  CreateSectionMessage,
  LoadDepartmentCourse,
} from "../types/departmentChairDashboardTypes";

// ✅ Department Details
export async function fetchDepartmentDetails(departmentId: number): Promise<DepartmentDetail[]> {
  const response = await axiosClient.get<DepartmentDetail[]>(`department_chair/department_detail/${departmentId}/`);
  return response.data;
}

// ✅ Loaded Courses (GET + POST)
export async function fetchDepartmentLoadedCourses(departmentId: number): Promise<DepartmentLoadedCoursesDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourses[]>(`department_chair/department_course_management/${departmentId}/`);
  return response.data.map((course) => ({
    id: course.loaded_course_id,
    course_code: course.course_code,
    course_title: course.course_title,
    program_name: course.program_name,
    year_level: course.year_level,
    semester_type: course.semester_type,
    department_name: course.department_name,
    academic_year: `${course.academic_year_start}-${course.academic_year_end}`,
    academicYearAndSem: `${course.academic_year_start}-${course.academic_year_end} ${course.semester_type}`,
  }));
}

export async function fetchLoadDepartmentCourse(
  departmentId: number,
  data: LoadDepartmentCourse
): Promise<LoadDepartmentCourseMessage> {
  const response = await axiosClient.post<LoadDepartmentCourseMessage>(
    `department_chair/department_course_management/${departmentId}/`,
    data
  );
  return response.data;
}

// ✅ Course Details (GET + DELETE)
export async function fetchDepartmentLoadedCourseDetails(
  departmentId: number,
  loadedCourseId: number
): Promise<DepartmentLoadedCourseDetailsDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourseDetails[]>(
    `department_chair/department_course_management/${departmentId}/${loadedCourseId}/`
  );
  return response.data.map((details) => ({
    course_title: details.course_title,
    department_name: details.department_name,
    college_name: details.college_name,
    campus_name: details.campus_name,
    semester_type: details.semester_type,
    year_level: details.year_level,
    academic_year: `${details.academic_year_start} - ${details.academic_year_end}`,
  }));
}

export async function fetchDeleteLoadedCourse(
  departmentId: number,
  loadedCourseId: number
): Promise<boolean> {
  await axiosClient.delete(`department_chair/department_course_management/${departmentId}/${loadedCourseId}/`);
  return true;
}

// ✅ Section Management (GET + POST)
export async function fetchDepartmentChairCourseSections(
  departmentId: number,
  loadedCourseId: number
): Promise<DepartmentLoadedCourseSectionsDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourseSections[]>(
    `department_chair/department_section_management/${departmentId}/${loadedCourseId}/`
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

export async function fetchCreateSection(
  departmentId: number,
  loadedCourseId: number,
  section: CreateSection
): Promise<CreateSectionMessage> {
  const response = await axiosClient.post<CreateSectionMessage>(
    `department_chair/department_section_management/${departmentId}/${loadedCourseId}/`,
    section
  );
  return response.data;
}

// ✅ Section Update / Delete
export async function fetchUpdateSection(
  departmentId: number,
  loadedCourseId: number,
  sectionId: number,
  updatedSection: Partial<CreateSection>
): Promise<CreateSectionMessage> {
  const response = await axiosClient.put<CreateSectionMessage>(
    `department_chair/department_section_management/${departmentId}/${loadedCourseId}/${sectionId}/`,
    updatedSection
  );
  return response.data;
}

export async function fetchDeleteLoadedCourseSection(
  departmentId: number,
  loadedCourseId: number,
  sectionId: number
): Promise<boolean> {
  await axiosClient.delete(`department_chair/department_section_management/${departmentId}/${loadedCourseId}/${sectionId}/`);
  return true;
}
