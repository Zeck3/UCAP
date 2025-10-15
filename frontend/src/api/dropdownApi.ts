import axiosClient from "./axiosClient";

import type {
  UserRole,
  Department,
  Program,
  YearLevel,
  Semester,
  Credit,
  Instructor,
  AcademicYear,
  BloomsClassification,
  CourseOutcomes,
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

export async function getDepartments(): Promise<Department[]> {
  try {
    const res = await axiosClient.get<Department[]>("/department/");
    return res.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function getPrograms(): Promise<Program[]> {
  try {
    const res = await axiosClient.get("/program/");
    return res.data;
  } catch (error) {
    console.error("Error fetching programs:", error);
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

export async function getInstructors(): Promise<Instructor[]> {
  try {
    const res = await axiosClient.get("/instructors/");
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

export async function getCourseOutcomes(courseCode: string): Promise<CourseOutcomes[]> {
  const { data } = await axiosClient.get(`/course_outcomes/${courseCode}`);
  return data;
}