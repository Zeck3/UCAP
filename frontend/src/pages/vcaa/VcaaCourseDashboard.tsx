import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../layout/AppLayout";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";

import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";

import { fetchVcaaLoadedCourses } from "../../api/vcaaDashboardApi";
import type { BaseLoadedCourse } from "../../types/baseTypes";
import InfoComponent from "../../components/InfoComponent";
import { useDepartment } from "../../context/useDepartment";

export default function CampusCourseDashboard() {
  const { department_id } = useParams();
  const { department } = useDepartment();
  const navigate = useNavigate();
  const { layout } = useLayout();

  const [courses, setCourses] = useState<BaseLoadedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!department_id) return;

      try {
        setLoading(true);
        const data = await fetchVcaaLoadedCourses(Number(department_id));

        const formatted = data.map((c) => ({
          ...c,
          id: c.loaded_course_id,
          academic_year_and_semester: `${c.academic_year_start}-${c.academic_year_end} / ${c.semester_type}`,
          year_level: c.year_level_type,
        }));

        setCourses(formatted);
      } catch (e) {
        console.error("Failed to fetch Campus loaded courses", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [department_id]);

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
    navigate(`/campus/${department_id}/${course.loaded_course_id}`, {
      state: {
        course_code: course.course_code,
      },
    });
  };

  return (
    <AppLayout activeItem={`/campus/${department_id}`}>
      <InfoComponent
        loading={loading}
        title={`${department?.campus_name} Campus`}
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
