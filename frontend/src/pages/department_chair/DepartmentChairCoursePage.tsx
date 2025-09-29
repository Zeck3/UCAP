import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import { getDepartmentCourseDetails } from "../../utils/getDepartmentCourseDetails";
import type { SectionItem } from "../../utils/getCourseDetails";
import emptyImage from "../../assets/undraw_file-search.svg";
import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import AppLayout from "../../layout/AppLayout";
import { useAuth } from "../../context/useAuth";
import SidePanelComponent from "../../components/SidePanelComponent";
import DropdownComponent from "../../components/DropDownComponent";
import UserInputComponent from "../../components/UserInputComponent";
import { dummy } from "../../data/dummy";
import { Roles } from "../../config/Roles";

export default function DepartmentChairCoursePage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { department_name, loaded_course_id, course_code } = useParams();
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();
  const db = dummy[0];

  const currentUserId = user?.user_id ?? null;
  const currentDepartmentId = user?.department_id ?? null;

  const courseDetails = useMemo(() => {
    if (!loaded_course_id) return null;
    return getDepartmentCourseDetails(Number(loaded_course_id));
  }, [loaded_course_id]);

  const filteredSections: SectionItem[] = useMemo(() => {
    if (!courseDetails) return [];

    const query = searchQuery.toLowerCase();

    return (courseDetails.sections ?? [])
      .filter(
        (s) =>
          s.year_and_section.toLowerCase().includes(query) ||
          s.instructor_assigned.toLowerCase().includes(query)
      )
      .map((s) => ({
        id: s.section_id,
        year_and_section: s.year_and_section,
        instructor_assigned: s.instructor_assigned,
      }));
  }, [courseDetails, searchQuery]);

  if (!currentUserId) {
    return <div>Unauthorized: No user logged in.</div>;
  }

  if (!courseDetails) {
    return <div>Loading course details...</div>;
  }

  function getDepartmentInstructors(departmentId: number) {
    const instructorRoles = [
      Roles.Instructor,
      Roles.DepartmentChair,
      Roles.Dean,
      Roles.ViceChancellorOfAcademicAffairs,
      Roles.VicePresidentOfAcademicAffairs,
    ];

    return db.user_tbl
      .filter(
        (u) =>
          u.department_id === departmentId &&
          instructorRoles.includes(u.role_id)
      )
      .map((u) => `${u.first_name} ${u.last_name}`);
  }

  const instructorOptions = currentDepartmentId
    ? getDepartmentInstructors(currentDepartmentId)
    : [];

  const goToDepartmentChairAssessmentPage = (section: SectionItem) => {
    navigate(
      `/department/${department_name}/${loaded_course_id}/${course_code}/${section.year_and_section}`
    );
  };

  return (
    <AppLayout activeItem={`/department/${department_name}`}>
      <InfoComponent
        title={courseDetails.course_title}
        subtitle={`${courseDetails.academic_year} ${
          courseDetails.semester ?? "N/A"
        } | ${courseDetails.year_level ?? "N/A"}`}
        details={`Department of ${courseDetails.department_name ?? "N/A"} | ${
          courseDetails.college_name ?? "N/A"
        } | ${courseDetails.campus_name ?? "N/A"} Campus`}
      />

      <ToolBarComponent
        titleOptions={[
          {
            label: "Section",
            value: "section",
            enableSearch: true,
            enableLayout: true,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onButtonClick={() => setIsPanelOpen(true)}
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        buttonLabel="Add Section"
      />

      {layout === "cards" ? (
        <CardsGridComponent
          items={filteredSections}
          onCardClick={goToDepartmentChairAssessmentPage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Sections Available!"
          aspectRatio="20/9"
          fieldTop={(section) => section.year_and_section}
          title={(section) => section.instructor_assigned}
          subtitle={() => "Instructor Assigned"}
          enableOption
        />
      ) : (
        <TableComponent
          data={filteredSections}
          onRowClick={goToDepartmentChairAssessmentPage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Sections Available!"
          columns={[
            { key: "year_and_section", label: "Section" },
            { key: "instructor_assigned", label: "Instructor Assigned" },
          ]}
          onEdit={(id) => console.log("Edit course", id)}
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Add Section"
        onSubmit={() => console.log("API Request POST")}
        fullWidthRow={false}
        buttonFunction="Add Section"
      >
        <UserInputComponent label="Year and Section" name="year_and_section" />
        <DropdownComponent
          label="Instructor Assigned"
          options={instructorOptions}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
