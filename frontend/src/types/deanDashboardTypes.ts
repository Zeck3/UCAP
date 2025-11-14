export interface DeanLoadedCourse {
  loaded_course_id: number;
  id: number;
  course_code: string;
  course_title: string;
  program_name: string;
  academic_year_start: number;
  academic_year_end: number;
  year_level_type: string;
  semester_type: string;
  academic_year_and_semester?: string;
  year_level?: string;
}

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

export type DeanCoursePageResponse = {
  course_details: CourseDetails;
  sections: SectionDisplay[];
};
