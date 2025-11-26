import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../layout/AppLayout";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";

import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";

import { fetchVcaaLoadedCourses } from "../../api/vcaaDashboardApi";
import type { BaseLoadedCourse } from "../../types/baseTypes";
import InfoComponent from "../../components/InfoComponent";
import { useInitialInfo } from "../../context/useInitialInfo";

export default function VcaaCourseDashboard() {
  const navigate = useNavigate();
  const { layout } = useLayout();

  const [courses, setCourses] = useState<BaseLoadedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { initialInfo, initialInfoLoading } = useInitialInfo();

  const campusId =
    initialInfo?.primary_campus?.campus_id ??
    (initialInfo?.leadership?.level === "campus"
      ? initialInfo.leadership.id
      : null);

  const campusName =
    initialInfo?.primary_campus?.campus_name ??
    (initialInfo?.leadership?.level === "campus"
      ? initialInfo.leadership.name
      : "");

  useEffect(() => {
    if (initialInfoLoading || campusId == null) return;

    let active = true;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchVcaaLoadedCourses(campusId);

        if (!active) return;

        setCourses(
          data.map((c) => ({
            ...c,
            id: c.loaded_course_id,
            academic_year_and_semester: `${c.academic_year_start}-${c.academic_year_end} / ${c.semester_type}`,
            year_level: c.year_level_type,
          }))
        );
      } catch (e) {
        console.error("Failed to fetch Campus loaded courses", e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [initialInfoLoading, campusId]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const augmented = courses.map((course) => ({
      ...course,
      id: course.loaded_course_id,
      academic_year_and_semester: `${course.academic_year_start}-${course.academic_year_end} / ${course.semester_type}`,
      year_level: course.year_level_type,
    }));

    if (!q) return augmented;

    return augmented.filter((course) =>
      Object.values(course).some((val) => {
        if (val == null) return false;

        const t = typeof val;
        if (t === "string" || t === "number" || t === "boolean") {
          return String(val).toLowerCase().includes(q);
        }

        return false;
      })
    );
  }, [searchQuery, courses]);

  const goToCampusCoursePage = (course: BaseLoadedCourse) => {
    navigate(`/campus/${campusId}/${course.loaded_course_id}`, {
      state: { course_code: course.course_code },
    });
  };

  return (
    <AppLayout activeItem={`/campus/${campusId}`}>
      <InfoComponent
        loading={loading || initialInfoLoading}
        title={`${campusName} Campus`}
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "Campus Courses",
            value: "courses",
            enableSearch: true,
            enableLayout: true,
            enableButton: false,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
      />

      {layout === "cards" ? (
        <CardsGridComponent
          items={filteredCourses}
          onCardClick={goToCampusCoursePage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          loading={loading}
          fieldTop={(c) => c.course_code}
          title={(c) => c.course_title}
          subtitle={(c) =>
            `${c.academic_year_start}-${c.academic_year_end} | ${c.semester_type} | ${c.program_name}`
          }
        />
      ) : (
        <TableComponent
          data={filteredCourses}
          onRowClick={goToCampusCoursePage}
          loading={loading}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          columns={[
            { key: "course_code", label: "Code" },
            { key: "course_title", label: "Course Title" },
            { key: "program_name", label: "Program" },
            {
              key: "academic_year_and_semester",
              label: "Academic Year & Semester",
            },
            { key: "year_level", label: "Year Level" },
          ]}
        />
      )}
    </AppLayout>
  );
}
