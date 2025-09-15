import { dummy } from "../data/dummy";

export interface SectionItem {
  id: number;
  year_and_section: string;
  instructor_assigned: string;
}

export function getDepartmentCourseDetails(loadedCourseId: number) {
  const db = dummy[0];

  const loadedCourse = db.loaded_course_tbl.find(
    (lc) => lc.loaded_course_id === loadedCourseId
  );
  if (!loadedCourse) return null;

  const course = db.course_tbl.find(
    (c) => c.course_code === loadedCourse.course_code
  );
  if (!course) return null;

  const academicYear = db.academic_year_tbl.find(
    (ay) => ay.academic_year_id === loadedCourse.academic_year_id
  );
  const semester = db.semester_tbl.find(
    (s) => s.semester_id === course.semester_id
  );
  const program = db.program_tbl.find(
    (p) => p.program_id === course.program_id
  );
  const department = db.department_tbl.find(
    (d) => d.department_id === program?.department_id
  );
  const college = db.college_tbl.find(
    (c) => c.college_id === department?.college_id
  );
  const campus = db.campus_tbl.find(
    (ca) => ca.campus_id === department?.campus_id
  );

  const yearLevel = db.year_level_tbl.find(
    (yl) => yl.year_level_id === course.year_level_id
  );

  const sections = db.section_tbl
    .filter((s) => s.loaded_course_id === loadedCourseId)
    .map((s) => {
      const instructor = db.user_tbl.find(
        (u) => u.user_id === s.instructor_assigned_id
      );
      return {
        section_id: s.section_id,
        year_and_section: s.year_and_section,
        instructor_id: s.instructor_assigned_id,
        instructor_assigned: instructor
          ? `${instructor.first_name} ${instructor.last_name}`
          : "Unknown",
      };
    });

  return {
    loaded_course_id: loadedCourse.loaded_course_id,
    course_code: course.course_code,
    course_title: course.course_title,
    academic_year: `${academicYear?.academic_year_start}-${academicYear?.academic_year_end}`,
    semester: semester?.semester_type,
    year_level: yearLevel?.year_level ?? "N/A",
    department_name: department?.department_name,
    college_name: college?.college_name,
    campus_name: campus?.campus_name,
    sections,
  };
}
