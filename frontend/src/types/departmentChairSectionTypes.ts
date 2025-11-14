export type CourseDetails = {
  course_code: string;
  course_title: string;
  academic_year: string;
  semester_type: string;
  year_level: string;
  department_name: string;
  college_name: string;
  campus_name: string;
};

export interface SectionDisplay {
  id: number;
  year_and_section: string;
  instructor_assigned: string;
  instructor_id: number | null;
}

export interface SectionPayload {
  year_and_section: string;
  instructor_assigned: number | null;
  loaded_course: number;
}
