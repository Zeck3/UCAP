import axiosClient from "./axiosClient";
import type {
  BaseLoadedCourse,
  BaseCoursePageResponse,
} from "../types/baseTypes";

export const fetchCampusLoadedCourses = async (
  campusId: number
): Promise<BaseLoadedCourse[]> => {
  const res = await axiosClient.get<BaseLoadedCourse[]>(`/campus/${campusId}/`);

  return res.data.map((course) => ({
    ...course,
    id: course.loaded_course_id,
    academic_year_and_semester: `${course.academic_year_start}-${course.academic_year_end} / ${course.semester_type}`,
  }));
};

export const fetchCampusCoursePage = async (
  loadedCourseId: number
): Promise<BaseCoursePageResponse> => {
  const res = await axiosClient.get<BaseCoursePageResponse>(
    `/campus/loaded_course/${loadedCourseId}/`
  );

  return {
    course_details: {
      ...res.data.course_details,
      loaded_course_id: loadedCourseId,
    },
    sections: res.data.sections.map((s) => ({
      ...s,
      id: s.section_id,
    })),
  };
};
