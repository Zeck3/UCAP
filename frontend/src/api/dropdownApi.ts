import axiosClient from "./axiosClient";

import type {
  UserRole,
  YearLevel,
  Semester,
  Credit,
  Instructor,
  AcademicYear,
  BloomsClassification,
  CourseOutcomes,
  Campus,
} from "../types/dropdownTypes";

export async function getRoles(): Promise<UserRole[]> {
  try {
    const res = await axiosClient.get<UserRole[]>("/user_role/");
    return res.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export async function getCampuses(): Promise<Campus[]> {
  try {
    const res = await axiosClient.get<Campus[]>("/campus/");
    return res.data;
  } catch (error) {
    console.error("Error fetching campuses:", error);
    return [];
  }
}

export async function getYearLevels(): Promise<YearLevel[]> {
  try {
    const res = await axiosClient.get("/year_level/");
    return res.data;
  } catch (error) {
    console.error("Error fetching year levels:", error);
    return [];
  }
}

export async function getSemesters(): Promise<Semester[]> {
  try {
    const res = await axiosClient.get("/semester/");
    return res.data;
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return [];
  }
}

export async function getCreditUnits(): Promise<Credit[]> {
  try {
    const res = await axiosClient.get("/credit_unit/");
    return res.data;
  } catch (error) {
    console.error("Error fetching credit units:", error);
    return [];
  }
}

export async function getInstructors(
  departmentId?: number | null
): Promise<Instructor[]> {
  try {
    const res = await axiosClient.get("/instructors/", {
      params: departmentId ? { department_id: departmentId } : {},
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching instructors:", error);
    return [];
  }
}

export async function getAcademicYears(): Promise<AcademicYear[]> {
  try {
    const res = await axiosClient.get("/academic_year/");
    return res.data;
  } catch (error) {
    console.error("Error fetching academic years:", error);
    return [];
  }
}

export async function getBloomsOptions(): Promise<BloomsClassification[]> {
  const { data } = await axiosClient.get("/blooms_classification/");
  return data;
}

export async function getCourseOutcomes(
  loadedCourseId: number
): Promise<CourseOutcomes[]> {
  const { data } = await axiosClient.get(`/course_outcomes/${loadedCourseId}`);
  return data;
}
