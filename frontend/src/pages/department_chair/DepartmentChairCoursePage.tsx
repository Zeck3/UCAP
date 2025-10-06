import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
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

import { getInstructors } from "../../api/dropdownApi";
import type { Instructor } from "../../types/dropdownTypes";
import { fetchDepartmentLoadedCourseDetails, fetchDepartmentChairCourseSections, deleteCourseSection } from "../../api/departmentChairSectionsApi";
import type { DepartmentLoadedCourseSectionsDisplay, DepartmentLoadedCourseDetailsDisplay } from "../../types/departmentChairDashboardTypes";

export default function DepartmentChairCoursePage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { department_name, loaded_course_id, course_code } = useParams();
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();

  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [sections, setSections] = useState<DepartmentLoadedCourseSectionsDisplay[]>([]);
  const [LoadedCourseDetails, setLoadedCourseDetails] = useState<DepartmentLoadedCourseDetailsDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.user_id ?? null;
  const departmentId = user?.department_id ?? null;

  useEffect(() => {
    async function getAllCoursesSections() {
      setLoading(true);
      const [courseData, instructorsData, sectionsData] = await Promise.all([
        fetchDepartmentLoadedCourseDetails(Number(departmentId), Number(loaded_course_id)),
        getInstructors(),
        fetchDepartmentChairCourseSections(Number(departmentId), Number(loaded_course_id)),
      ]);
      setLoadedCourseDetails(courseData);
      setInstructors(instructorsData);
      setSections(sectionsData);
      setLoading(false);
    }
    getAllCoursesSections();
    }, [departmentId, loaded_course_id]);

  const filteredSections = useMemo(() => {
    if (!sections) return [];

    const query = searchQuery.toLowerCase();

    return sections.filter(
        (s) =>
          s.year_and_section.toLowerCase().includes(query) ||
          s.instructor_assigned.toLowerCase().includes(query)
      )
      .map((s) => ({
        id: s.id,
        year_and_section: s.year_and_section,
        instructor_assigned: s.instructor_assigned,
      }));
  }, [sections, searchQuery]);

  const instructorOptions = instructors.map((inst) => ({
    label: `${inst.first_name} ${inst.last_name}`,
    value: inst.user_id.toString(), 
  }));

  const handleDelete = async (id: DepartmentLoadedCourseSectionsDisplay["id"]) => {
    try {
      console.log("Deleting section with id:", id);
      const success = await deleteCourseSection(id);
      console.log("API result:", success);

      setSections((prev) => {
        console.log("Before delete:", prev);
        const updated = prev.filter((u) => u.id !== id);
        console.log("After delete:", updated);
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete section", error);
    }
  };
 
  const goToDepartmentChairAssessmentPage = (section: DepartmentLoadedCourseSectionsDisplay) => {
  navigate(
    `/department/${LoadedCourseDetails[0].department_name}/${loaded_course_id}/${course_code}/${section.year_and_section}`
  );
};

  if (!currentUserId) {
    return <div>Unauthorized: No user logged in.</div>;
  }

  if (!sections) {
    return <div>Loading course details...</div>;
  }

  return (
    <AppLayout activeItem={`/department/${department_name}`}>
      <InfoComponent
        title={LoadedCourseDetails.map((cd) => cd.course_title).join(", ") || "N/A"}
        subtitle={`${LoadedCourseDetails.map((cd) => cd.academic_year)} ${
          LoadedCourseDetails.map((cd) => cd.semester_type)
        } | ${LoadedCourseDetails.map((cd) => cd.year_level).join(", ")}`}
        details={`Department of ${LoadedCourseDetails.map((cd) => cd.department_name).join(", ")} | ${
          LoadedCourseDetails.map((cd) => cd.college_name).join(", ")
        } | ${LoadedCourseDetails.map((cd) => cd.college_name).join(", ")} Campus`}
        
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
          onCardClick={(section) => goToDepartmentChairAssessmentPage(section)}
          emptyImageSrc={emptyImage}
          emptyMessage="No Sections Available!"
          aspectRatio="20/9"
          fieldTop={(section) => section.year_and_section}
          title={(section) => section.instructor_assigned}
          subtitle={() => "Instructor Assigned"}
          onDelete={(section) => handleDelete(Number(section))}
          enableOption
        />
      ) : (
        <TableComponent
          data={filteredSections}
          onRowClick={(section) => goToDepartmentChairAssessmentPage(section)}
          emptyImageSrc={emptyImage}
          emptyMessage="No Sections Available!"
          columns={[
            { key: "year_and_section", label: "Section" },
            { key: "instructor_assigned", label: "Instructor Assigned" },
          ]}
          onEdit={(section) => console.log("Edit", section)}
          onDelete={handleDelete} 
          loading={loading}
          skeletonRows={2}
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Add Section"
        onSubmit={() => console.log("API Request POST")}
        buttonFunction="Add Section"
      >
        <UserInputComponent 
          label="Year and Section" 
          name="year_and_section" 
          value={""} 
          onChange={() => {}}
        />
        <DropdownComponent
          label="Instructor Assigned"
          name="instructor_assigned"
          options={instructorOptions}
          value={""+selectedInstructorId}
          onChange={(_, val) => {setSelectedInstructorId(val);}}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
