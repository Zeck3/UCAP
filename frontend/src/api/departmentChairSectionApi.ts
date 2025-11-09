// api/departmentChairSectionApi.ts
import axiosClient from "./axiosClient";
import type {
  CourseDetails,
  SectionDisplay,
  SectionPayload,
} from "../types/departmentChairSectionTypes";

export async function getSections(loadedCourseId: number) {
  const { data } = await axiosClient.get<{
    course_details: CourseDetails;
    sections: SectionDisplay[];
  }>(`department_chair/section_management/loaded_course/${loadedCourseId}/`);
  return data;
}

export async function addSection(
  loadedCourseId: number,
  section: SectionPayload
): Promise<void> {
  await axiosClient.post(
    `department_chair/section_management/loaded_course/${loadedCourseId}/`,
    section
  );
}

export async function editSection(
  sectionId: number,
  updatedSection: Partial<SectionPayload>
): Promise<void> {
  await axiosClient.put(
    `department_chair/section_management/section/${sectionId}/`,
    updatedSection
  );
}

export async function deleteSection(sectionId: number): Promise<boolean> {
  await axiosClient.delete(
    `department_chair/section_management/section/${sectionId}/`
  );
  return true;
}
