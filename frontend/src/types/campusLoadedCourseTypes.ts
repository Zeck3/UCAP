export interface CampusCourseDetails {
  loaded_course_id: number;
  course_code: string;
  course_title: string;
  program_name: string;
  academic_year_start: number;
  academic_year_end: number;
  semester_type: string;
  year_level_type: string;
  department_name: string;
  college_name: string;
  campus_name: string;
}

export interface CampusSectionDisplay {
  id: number;
  year_and_section: string;
  instructor_assigned: string;
  instructor_id: number | null;
}

export interface CampusCoursePageResponse {
  course_details: CampusCourseDetails;
  sections: CampusSectionDisplay[];
}
