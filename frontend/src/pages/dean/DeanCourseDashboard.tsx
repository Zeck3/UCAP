import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../layout/AppLayout";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";

import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";
import { fetchDeanLoadedCourses } from "../../api/deanDashboardApi";
import InfoComponent from "../../components/InfoComponent";
import type { BaseLoadedCourse } from "../../types/baseTypes";
import { useInitialInfo } from "../../context/useInitialInfo";

export default function DeanCourseDashboard() {
  const navigate = useNavigate();
  const { initialInfo, initialInfoLoading } = useInitialInfo();

  const { layout } = useLayout();

  const [courses, setCourses] = useState<BaseLoadedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const collegeId =
    initialInfo?.primary_college?.college_id ??
    (initialInfo?.leadership?.level === "college"
      ? initialInfo.leadership.id
      : null);

  const collegeName =
    initialInfo?.primary_college?.college_name ??
    (initialInfo?.leadership?.level === "college"
      ? initialInfo.leadership.name
      : "");

  const campusName =
    initialInfo?.primary_campus?.campus_name ??
    (initialInfo?.leadership?.level === "campus"
      ? initialInfo.leadership.name
      : "");

  useEffect(() => {
    const load = async () => {
      try {
        if (!collegeId) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const data = await fetchDeanLoadedCourses(Number(collegeId));
        const formatted = data.map((c) => ({
          ...c,
          id: c.loaded_course_id,
          academic_year_and_semester: `${c.academic_year_start}-${c.academic_year_end} / ${c.semester_type}`,
          year_level: c.year_level_type,
        }));

        setCourses(formatted);
      } catch (e) {
        console.error("Failed to fetch dean loaded courses", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [collegeId]);

  const filteredLoadedCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((course) =>
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

  const goToDeanCoursePage = (course: BaseLoadedCourse) => {
    navigate(`/college/${collegeId}/${course.loaded_course_id}`, {
      state: {
        course_code: course.course_code,
      },
    });
  };

  return (
    <AppLayout activeItem={`/college/${collegeId}`}>
      <InfoComponent
        loading={loading || initialInfoLoading}
        title={collegeName || "College"}
        subtitle={campusName ? `${campusName} Campus` : "Campus"}
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "College Courses",
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
          items={filteredLoadedCourses}
          onCardClick={goToDeanCoursePage}
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
          data={filteredLoadedCourses}
          onRowClick={goToDeanCoursePage}
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
            { key: "year_level_type", label: "Year Level" },
          ]}
          loading={loading}
        />
      )}
    </AppLayout>
  );
}
