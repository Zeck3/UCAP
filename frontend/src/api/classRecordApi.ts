import axiosClient from "./axiosClient";
import type {
  ClassRecord,
  Student,
  Assessment,
  CourseComponent,
  CourseUnit,
  AssessmentInfosResponse,
  AssessmentInfo,
} from "../types/classRecordTypes";

export async function getClassRecord(sectionId: number) {
  const { data } = await axiosClient.get<ClassRecord>(
    `/instructor/class_record/${sectionId}/`
  );
  return data;
}

export async function createStudent(
  student: Partial<Student>,
  sectionId: number
) {
  const { data } = await axiosClient.post<Student>(
    `/instructor/students/?section=${sectionId}`,
    student
  );
  return data;
}

export async function updateStudent(
  studentId: number,
  updates: Partial<Student>
) {
  const { data } = await axiosClient.patch<Student>(
    `/instructor/students/${studentId}/`,
    updates
  );
  return data;
}

export async function deleteStudent(studentId: number) {
  await axiosClient.delete(`/instructor/students/${studentId}/`);
}

export async function createAssessment(assessment: Partial<Assessment>) {
  const { data } = await axiosClient.post<Assessment>(
    `/instructor/assessments/`,
    assessment
  );
  return data;
}

export async function getAssessmentInfos(
  ids: number[]
): Promise<AssessmentInfo[]> {
  if (!ids.length) return [];

  const { data } = await axiosClient.post<AssessmentInfosResponse[]>(
    "/instructor/assessments/infos/",
    { ids }
  );

  return data.map((item) => ({
    id: item.assessment_id,
    blooms: item.blooms_classification ?? [],
    outcomes: item.course_outcome ?? [],
  }));
}

export async function updateAssessment(
  assessmentId: number,
  updates: Partial<Assessment>
) {
  const { data } = await axiosClient.patch<Assessment>(
    `/instructor/assessments/${assessmentId}/`,
    updates
  );
  return data;
}

export async function deleteAssessment(assessmentId: number) {
  await axiosClient.delete(`/instructor/assessments/${assessmentId}/`);
}

export async function updateCourseComponent(
  componentId: number,
  updates: Partial<CourseComponent>
) {
  const validUpdates: Partial<CourseComponent> = {};
  if (
    updates.course_component_percentage !== undefined &&
    updates.course_component_percentage !== null
  ) {
    validUpdates.course_component_percentage =
      updates.course_component_percentage;
  }
  if (
    updates.course_component_type &&
    updates.course_component_type.trim() !== ""
  ) {
    validUpdates.course_component_type = updates.course_component_type;
  }

  const { data } = await axiosClient.patch<CourseComponent>(
    `/instructor/course-components/${componentId}/`,
    validUpdates
  );
  return data;
}

export async function updateCourseUnit(
  unitId: number,
  updates: Partial<CourseUnit>
) {
  const validUpdates: Partial<CourseUnit> = {};

  if (
    updates.course_unit_percentage !== undefined &&
    updates.course_unit_percentage !== null
  ) {
    validUpdates.course_unit_percentage = updates.course_unit_percentage;
  }

  const { data } = await axiosClient.patch<CourseUnit>(
    `/instructor/course-units/${unitId}/`,
    validUpdates
  );
  return data;
}

export async function updateRawScore(
  studentId: number,
  assessmentId: number,
  value: number | null
) {
  const { data } = await axiosClient.patch<{
    student_id: number;
    assessment_id: number;
    value: number | null;
  }>(`/instructor/rawscores/${studentId}/${assessmentId}/`, { value });
  return data;
}
