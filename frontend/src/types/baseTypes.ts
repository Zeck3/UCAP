export interface BaseLoadedCourse {
  id: number;
  loaded_course_id: number;
  course_code: string;
  course_title: string;
  program_id: number;
  program_name: string;
  academic_year_start: number;
  academic_year_end: number;
  semester_type: string;
  academic_year_and_semester: string;
  year_level_type: string;
}

export interface BaseCourseDetails {
  loaded_course_id: number;
  course_code: string;
  course_title: string;
  academic_year: string;
  semester_type: string;
  year_level: string;
  program_id: number;
  program_name: string;
  department_name: string;
  college_name: string;
  campus_name: string;
}

export interface BaseSection {
  id: number;
  section_id: number;
  year_and_section: string;
  instructor_assigned: string;
  instructor_id: number | null;
}

export interface BaseCoursePageResponse {
  course_details: BaseCourseDetails;
  sections: BaseSection[];
}
