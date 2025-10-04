import { useNavigate } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/useAuth";
import { InstructorCourses } from "../../api/instructorDashboardApi";
import type { InstructorCourse } from "../../types/instructorDashboardTypes";
import emptyImage from "../../assets/undraw_file-search.svg";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import AppLayout from "../../layout/AppLayout";

export default function CourseDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
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
    const filtered = query
      ? courses.filter(
          (course) =>
            course.course_code.toLowerCase().includes(query) ||
            course.course_title.toLowerCase().includes(query)
        )
      : courses;

    return filtered.map((course) => ({
      ...course,
      id: course.loaded_course_id,
    }));
  }, [searchQuery, courses]);

  const goToCoursePage = (course: InstructorCourse) => {
    navigate(
      `/instructor/${course.loaded_course_id}/${course.course_code.replace(
        /\s+/g,
        ""
      )}`
    );
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
            const semesterText = course.semester_type
              .toLowerCase()
              .replace("semester", "sem")
              .trim();
            return `${course.academic_year} ${semesterText} | ${course.department_name}`;
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
            { key: "academic_year", label: "Academic Year" },
            { key: "semester_type", label: "Semester" },
            { key: "department_name", label: "Department" },
          ]}
        />
      )}
    </AppLayout>
  );
}
