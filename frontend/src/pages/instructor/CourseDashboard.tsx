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

  // 🔹 Filter courses
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query)
    );
  }, [searchQuery, courses]);

  // 🔹 Navigate on course click
  const goToCoursePage = (course: InstructorCourse) => {
    navigate(`/instructor/${course.id}/${course.course_code.replace(/\s+/g, "")}`);
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
      {loading ? (
        <p className="text-center mt-4">Loading courses...</p>
      ) : layout === "cards" ? (
        <CardsGridComponent
          items={filteredCourses}
          onCardClick={goToCoursePage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          fieldTop="course_code"
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
          columns={[
            { key: "course_code", label: "Code" },
            { key: "course_title", label: "Course Title" },
            { key: "academic_year", label: "Academic Year" },
            { key: "semester_type", label: "Semester" },
            { key: "department_name", label: "Department" },
          ]}
          onEdit={(id) => console.log("Edit course", id)}
        />
      )}
    </AppLayout>
  );
}
