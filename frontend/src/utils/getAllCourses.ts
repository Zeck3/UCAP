import { dummy } from "../data/dummy";

export interface CourseDetails {
  id: string;
  course_code: string;
  course_title: string;
  program_name: string;
  semester_type: string;
  year_level: string;
}

export function getAllCourses(): CourseDetails[] {
  const { program_tbl, semester_tbl, year_level_tbl, course_tbl } = dummy[0];

  return course_tbl.map((course) => {
    const program = program_tbl.find((p) => p.program_id === course.program_id);
    const semester = semester_tbl.find(
      (s) => s.semester_id === course.semester_id
    );
    const year = year_level_tbl.find(
      (y) => y.year_level_id === course.year_level_id
    );

    return {
      id: course.course_code,
      course_code: course.course_code,
      course_title: course.course_title,
      program_name: program?.program_name ?? "N/A",
      semester_type: semester?.semester_type ?? "N/A",
      year_level: year?.year_level ?? "N/A",
    } satisfies CourseDetails;
  });
}
