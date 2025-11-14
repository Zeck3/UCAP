
export type User = {
  user_id: number;
  role_id: number;
  department_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
};

export type InstructorCourse = {
  loaded_course_id: number;
  course_code: string;
  course_title: string;
  academic_year: string;
  semester_type: string;
  department_name: string;
  year_level_type: string;
};

export type CourseDetails = {
  course_code: string;
  course_title: string;
  semester_type: string;
  year_level: string;
  department_name: string;
  college_name: string;
  campus_name: string;
  academic_year: string;
};


export type AssignedSection = {
  section_id: number;
  year_and_section: string;
  instructor_assigned: string | null;
};

export type CourseDetailsWithSections = {
  course_details: CourseDetails;
  sections: AssignedSection[];
};
