import { useNavigate } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import { useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth";
import { getInstructorCourses } from "../../utils/getInstructorCourses";
import type { InstructorCourse } from "../../utils/getInstructorCourses";
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

  const currentUserId = user?.user_id ?? null;

  const instructorCourses: InstructorCourse[] = useMemo(() => {
    if (!currentUserId) return [];
    return getInstructorCourses(currentUserId);
  }, [currentUserId]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return instructorCourses;

    const query = searchQuery.toLowerCase();
    return instructorCourses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query)
    );
  }, [searchQuery, instructorCourses]);

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
      {layout === "cards" ? (
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
