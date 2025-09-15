import { useMemo, useState } from "react";
import { getAllCourses } from "../../utils/getAllCourses";
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
import dummy from "../../data/dummy";

export default function AdminCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { layout } = useLayout();
  const courses: CourseDetails[] = getAllCourses();
  const db = dummy[0];

  const departmentOptions = db.department_tbl.map((c) => c.department_name);
  const yearLevelOptions = db.year_level_tbl.map((c) => c.year_level);
  const semesterOptions = db.semester_tbl.map((c) => c.semester_type);

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
      {layout === "cards" ? (
        <CardsGridComponent
          onCardClick={(id) => console.log("Clicked Course", id)}
          onEdit={(id) => console.log("Edit course", id)}
          onDelete={(id) => console.log("Delete course", id)}
          items={filteredCourses}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          fieldTop="id"
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
          options={departmentOptions}
        />
        <UserInputComponent label="Credit Unit" name="credit_unit" />
        <DropdownComponent
          label="Year Level"
          options={yearLevelOptions}
        />
        <DropdownComponent
          label="Semester"
          options={semesterOptions}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
