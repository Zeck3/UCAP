import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import AppLayout from "../../layout/AppLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";
import { useAuth } from "../../context/useAuth";
import { getDepartmentCourses } from "../../utils/getDepartmentCourses";
import type { DepartmentCourse } from "../../utils/getDepartmentCourses";
import { useMemo, useState } from "react";
import { getUserDepartmentInfo } from "../../utils/getDepartmentInfo";
import PlusIcon from "../../assets/plus-solid.svg?react";
import SidePanelComponent from "../../components/SidePanelComponent";
import DropdownComponent from "../../components/DropDownComponent";
import dummy from "../../data/dummy";
import { useNavigate, useParams } from "react-router-dom";

export default function DepartmentChairCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { layout } = useLayout();
  const { user } = useAuth();
  const navigate = useNavigate();
  const departmentInfo = getUserDepartmentInfo(user);
  const { department_name } = useParams();
  const db = dummy[0];

  const academicYearOptions = db.academic_year_tbl.map(
    (ay) => `${ay.academic_year_start}-${ay.academic_year_end}`
  );

  const currentUserId = user?.user_id ?? null;

  const DepartmentCourses: DepartmentCourse[] = useMemo(() => {
    if (!currentUserId) return [];
    return getDepartmentCourses(currentUserId);
  }, [currentUserId]);

  const mappedDepartmentCourses = useMemo(() => {
    return DepartmentCourses.map((c) => ({
      ...c,
      academicYearAndSem: `${c.academic_year} ${c.semester_type
        .toLowerCase()
        .replace("semester", "sem")
        .trim()}`,
    }));
  }, [DepartmentCourses]);

  const filteredDepartmentCourses = useMemo(() => {
    if (!searchQuery.trim()) return mappedDepartmentCourses;

    const query = searchQuery.toLowerCase();
    return mappedDepartmentCourses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query) ||
        course.academicYearAndSem.toLowerCase().includes(query)
    );
  }, [searchQuery, mappedDepartmentCourses]);

  const goToDepartmentChairCoursePage = (course: DepartmentCourse) => {
    const departmentName = course.department_name?.replace(/\s+/g, "") ?? "";
    const loadedCourseId = course.id;
    const courseCode = course.course_code?.replace(/\s+/g, "") ?? "";
    navigate(`/department/${departmentName}/${loadedCourseId}/${courseCode}`);
  };

  return (
    <AppLayout activeItem={`/department/${department_name}`}>
      <InfoComponent
        title={`Department of ${departmentInfo?.department_name || "Department"}`}
        subtitle={departmentInfo?.college_name ?? "College"}
        details={`${departmentInfo?.campus_name || "Department"} Campus`}
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "Department Courses",
            value: "courses",
            enableSearch: true,
            enableLayout: true,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onButtonClick={() => setIsPanelOpen(true)}
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        buttonLabel="Load Courses"
      />

      {layout === "cards" ? (
        <CardsGridComponent
          items={filteredDepartmentCourses}
          onCardClick={goToDepartmentChairCoursePage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          fieldTop={(c) => c.course_code}
          title={(c) => c.course_title}
          subtitle={(course) => {
            const semesterText = course.semester_type
              .toLowerCase()
              .replace("semester", "sem")
              .trim();
            return `${course.academic_year} ${semesterText} | ${course.program_name}`;
          }}
          enableOption
        />
      ) : (
        <TableComponent
          data={filteredDepartmentCourses}
          onRowClick={goToDepartmentChairCoursePage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          columns={[
            { key: "course_code", label: "Code" },
            { key: "course_title", label: "Course Title" },
            { key: "program_name", label: "Program" },
            { key: "academicYearAndSem", label: "Academic Year & Sem" },
            { key: "year_level", label: "Year Level" },
          ]}
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Load Courses"
        submit={() => console.log("API Request POST")}
        fullWidthRow={false}
        buttonFunction="Load Courses"
      >
        <DropdownComponent
          label="Academic Year"
          options={academicYearOptions}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
