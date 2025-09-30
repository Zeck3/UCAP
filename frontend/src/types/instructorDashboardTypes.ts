
export type User = {
  user_id: number;
  role_id: number;
  department_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
};

export type InstructorCourse = {
  id: number;
  course_code: string;
  course_title: string;
  academic_year: string;
  semester_type: string;
  department_name: string;
};

export type CourseDetailsWithSections = {
  id: number;
  course_title: string;
  academic_year: string;
  semester_type: string;
  year_level: string;
  department_name: string;
  college_name: string;
  campus_name: string;
  year_and_section: string;
  instructor_assigned: string;
};

export type SectionItem = {
  id: number;
  year_and_section: string;
  instructor_assigned: string;
};