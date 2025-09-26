import { useMemo, useState, useEffect } from "react";
import { getAllCourses, getDepartments, getSemesters, getYearLevels } from "../../utils/getAllCourses";
import type { CourseDetails } from "../../utils/getAllCourses";
import { useLayout } from "../../context/useLayout";
import ToolBarComponent from "../../components/ToolBarComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import emptyImage from "../../assets/undraw_file-search.svg";
import TableComponent from "../../components/TableComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import SidePanelComponent from "../../components/SidePanelComponent";
import UserInputComponent from "../../components/UserInputComponent";
import DropdownComponent from "../../components/DropDownComponent";
import AppLayout from "../../layout/AppLayout";


export default function AdminCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { layout } = useLayout();
  const [departments, setDepartments] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [yearLevels, setYearLevels] = useState<any[]>([]);

useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
      setLoading(false);
      const departments = await getDepartments();
      setDepartments(departments);
      const semesters = await getSemesters();
      setSemesters(semesters);
      const yearLevels = await getYearLevels();
      setYearLevels(yearLevels);
    }
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query)
    );
  }, [searchQuery, courses]);
  return (
    <AppLayout
      activeItem="/admin/course_management"
    >
      <ToolBarComponent
        titleOptions={[
          {
            label: "All Courses",
            value: "",
            enableSearch: true,
            enableLayout: true,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        buttonLabel="Add Course"
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        onButtonClick={() => setIsPanelOpen(true)}
      />
      {loading ? (
        <p className="text-center mt-4">Loading courses...</p>
      ) : layout === "cards" ? (
        <CardsGridComponent
          onCardClick={(id) => console.log("Clicked Course", id)}
          onEdit={(id) => console.log("Edit course", id)}
          onDelete={(id) => console.log("Delete course", id)}
          items={filteredCourses}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          fieldTop={(course) => course.course_code}
          title={(course) => course.course_title}
          subtitle={(course) => {
            const semesterText = course.semester_type
              .toLowerCase()
              .replace("semester", "sem")
              .trim();
            return `${course.year_level} ${semesterText} | ${course.program_name}`;
          }}
          disableCardPointer
          enableOption
        />
      ) : (
        <TableComponent
          data={filteredCourses}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          columns={[
            { key: "course_code", label: "Code" },
            { key: "course_title", label: "Course Title" },
            { key: "program_name", label: "Program" },
            { key: "semester_type", label: "Semester" },
            { key: "year_level", label: "Year Level" },
          ]}
          onEdit={(id) => console.log("Edit course", id)}
          onDelete={(id) => console.log("Delete course", id)}
          disableRowPointer
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Add Course"
        submit={() => console.log("API Request POST")}
        fullWidthRow={false}
        buttonFunction="Create Course"
      >
        <UserInputComponent label="Course Code" name="course_code" />
        <UserInputComponent label="Lecture Unit" name="lecture_unit" />
        <UserInputComponent label="Course Title" name="course_title" />
        <UserInputComponent label="Laboratory Unit" name="laboratory_unit" />
        <DropdownComponent
          label="Department"
          options={departments.map((d) => d.department_name)}
        />
        <UserInputComponent label="Credit Unit" name="credit_unit" />
        <DropdownComponent
          label="Year Level"
          options={yearLevels.map((y) => y.year_level)}
        />
        <DropdownComponent
          label="Semester"
          options={semesters.map((s) => s.semester_type)}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
