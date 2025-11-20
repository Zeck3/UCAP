import { useNavigate } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { InstructorCourses } from "../../api/instructorDashboardApi";
import emptyImage from "../../assets/undraw_file-search.svg";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import AppLayout from "../../layout/AppLayout";
import type { BaseLoadedCourse } from "../../types/baseTypes";

export default function CourseDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<BaseLoadedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.user_id ?? null;

  useEffect(() => {
    async function fetchCourses() {
      if (!currentUserId) return;
      try {
        setLoading(true);
        const data = await InstructorCourses(currentUserId);
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch instructor courses:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, [currentUserId]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const augmented = courses.map((course) => {
      const academicYear = `${course.academic_year_start}-${course.academic_year_end}`;

      return {
        ...course,
        id: course.loaded_course_id,
        academic_year: academicYear,
        year_sem: `${academicYear} / ${course.semester_type}`,
      };
    });

    if (!query) return augmented;

    return augmented.filter((course) =>
      Object.values(course).some((val) => {
        if (val == null) return false;

        const t = typeof val;
        if (t === "string" || t === "number" || t === "boolean") {
          return String(val).toLowerCase().includes(query);
        }

        return false;
      })
    );
  }, [searchQuery, courses]);

  const goToCoursePage = (course: BaseLoadedCourse) => {
    navigate(`/instructor/${course.loaded_course_id}`, {
      state: {
        course_code: course.course_code,
      },
    });
  };

  return (
    <AppLayout activeItem="/instructor">
      <ToolBarComponent
        titleOptions={[
          {
            label: "My Courses",
            value: "",
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
          onCardClick={goToCoursePage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          fieldTop="course_code"
          loading={loading}
          title={(course) => course.course_title}
          subtitle={(course) => {
            return `${course.academic_year} | ${course.semester_type} | ${course.program_name}`;
          }}
        />
      ) : (
        <TableComponent
          data={filteredCourses}
          onRowClick={goToCoursePage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          loading={loading}
          columns={[
            { key: "course_code", label: "Code" },
            { key: "course_title", label: "Course Title" },
            { key: "year_sem", label: "Academic Year & Semester" },
            { key: "program_name", label: "Department" },
            { key: "year_level_type", label: "Year Level" },
          ]}
        />
      )}
    </AppLayout>
  );
}
