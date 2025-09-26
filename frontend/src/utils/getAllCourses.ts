import axios from "axios";

export interface CourseDetails {
  id: string;
  course_code: string;
  course_title: string;
  program_name: string;
  semester_type: string;
  year_level: string;
}

const API_URL_FACULTY = "http://localhost:8000/api/admin/faculty_management/";
const API_URL_COURSE = "http://localhost:8000/api/admin/course_management/";


export async function getAllCourses(): Promise<CourseDetails[]> {
  try {
    const res = await axios.get(`${API_URL_FACULTY}course_list/`);
    return res.data.map((course: any) => ({
      id: course.course_id,
      course_code: course.course_code,
      course_title: course.course_title,
      program_name: course.program,
      semester_type: course.semester,
      year_level: course.year_level,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getDepartments() {
  try {
    const res = await axios.get(`${API_URL_FACULTY}departments/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function getYearLevels() {
  try {
    const res = await axios.get(`${API_URL_COURSE}year_levels/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching year levels:", error);
    return [];
  }
}

export async function getSemesters() {
  try {
    const res = await axios.get(`${API_URL_COURSE}semesters/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return [];
  }
}