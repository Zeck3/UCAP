import axiosClient from "./axiosClient";
import type { DepartmentLoadedCourseSections, DepartmentLoadedCourseDetails, DepartmentLoadedCourseDetailsDisplay, DepartmentLoadedCourseSectionsDisplay, CreateSection, CreateSectionMessage } from "../types/departmentChairDashboardTypes";

function mapCourseDetails(details: DepartmentLoadedCourseDetails): DepartmentLoadedCourseDetailsDisplay {
  return {
    course_title: details.course_title,
    department_name: details.department_name,
    college_name: details.college_name,
    campus_name: details.campus_name,
    semester_type: details.semester_type,
    year_level: details.year_level,
    academic_year: `${details.academic_year_start} - ${details.academic_year_end}`,
  };
}

function mapSectionDetails(details: DepartmentLoadedCourseSections): DepartmentLoadedCourseSectionsDisplay {
  const hasInstructor = details.first_name || details.last_name;
  return {
    id: details.section_id,
    year_and_section: details.year_and_section,
    instructor_assigned: hasInstructor ? `${details.first_name ? details.first_name : ""} ${details.last_name}` : "NO INSTRUCTOR ASSIGNED",
  };
}

export async function fetchDepartmentLoadedCourseDetails(departmentId: number, loadedCourseId: number): Promise<DepartmentLoadedCourseDetailsDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourseDetails[]>(`department_chair/course_details/${departmentId}/${loadedCourseId}`);
  return response.data.map(mapCourseDetails);
};

export async function fetchDepartmentChairCourseSections(departmentId: number, loadedCourseId: number): Promise<DepartmentLoadedCourseSectionsDisplay[]> {
  const response = await axiosClient.get<DepartmentLoadedCourseSections[]>(`department_chair/sections/${departmentId}/${loadedCourseId}`);
  return response.data.map(mapSectionDetails);
}; 

export async function  fetchCreateSection(section: CreateSection): Promise<CreateSectionMessage> {
  const response = await axiosClient.post<CreateSectionMessage>(`department_chair/section_management/`, section);
  return response.data;
};

export async function fetchUpdateSection(sectionId: number, updatedSection: Partial<CreateSection> ): Promise<CreateSectionMessage> {
  const response = await axiosClient.put<CreateSectionMessage>(`department_chair/create_section/`, { section_id: sectionId, ...updatedSection });
  return response.data;
};

export async function fetchDeleteLoadedCourseSection(loadedCourseId: number, sectionId: number): Promise<boolean> {
  await axiosClient.delete(`department_chair/delete_section/${loadedCourseId}/${sectionId}`);
  return true;
};