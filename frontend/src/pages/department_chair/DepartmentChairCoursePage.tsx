import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
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
import {
  getSections,
  addSection,
  editSection,
  deleteSection,
} from "../../api/departmentChairSectionApi";
import type {
  CourseDetails,
  SectionDisplay,
  SectionPayload,
} from "../../types/departmentChairSectionTypes";
import InfoComponent from "../../components/InfoComponent";

export default function DepartmentChairCoursePage() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { department_id, department_name, loaded_course_id, course_code } =
    useParams();
  const loadedCourseId = Number(loaded_course_id ?? 0);
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();

  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(
    null
  );

  const [sections, setSections] = useState<SectionDisplay[]>([]);

  const [loading, setLoading] = useState(true);

  const currentUserId = user?.user_id ?? null;
  const departmentId = user?.department_id ?? null;

  const [sectionName, setSectionName] = useState<{ [key: string]: string }>({});

  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionDisplay | null>(
    null
  );
  const [sidePanelLoading, setSidePanelLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function getAllCoursesSections() {
      setLoading(true);
      try {
        const [instructorsData, { course_details, sections }] =
          await Promise.all([
            getInstructors(),
            getSections(Number(loaded_course_id)),
          ]);

        setInstructors(instructorsData);
        setCourseDetails(course_details);

        const mappedSections: SectionDisplay[] = sections.map((s) => ({
          id: s.id,
          year_and_section: s.year_and_section,
          instructor_assigned: s.instructor_assigned,
          instructor_id: s.instructor_id ?? null,
        }));

        setSections(mapAndSortSections(mappedSections));
      } catch (error) {
        console.error("Error fetching course sections:", error);
      } finally {
        setLoading(false);
      }
    }

    getAllCoursesSections();
  }, [departmentId, loaded_course_id]);

  const mapAndSortSections = (sections: SectionDisplay[]): SectionDisplay[] => {
    return [...sections].sort((a, b) =>
      a.year_and_section.localeCompare(b.year_and_section, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  };

  const handleClearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const filteredSections = useMemo(() => {
    if (!sections) return [];

    const query = searchQuery.toLowerCase();

    return sections
      .filter(
        (s) =>
          s.year_and_section.toLowerCase().includes(query) ||
          s.instructor_assigned.toLowerCase().includes(query)
      )
      .map((s) => ({
        id: s.id,
        year_and_section: s.year_and_section,
        instructor_assigned: s.instructor_assigned,
        instructor_id: s.instructor_id ?? null,
      }));
  }, [sections, searchQuery]);

  const instructorOptions = instructors.map((inst) => ({
    label:
      inst.first_name || inst.last_name
        ? `${inst.first_name ?? ""} ${inst.last_name ?? ""}`.trim()
        : "",
    value: inst.user_id?.toString() ?? "",
  }));

  const handlesInputChange = (name: string, value: string) => {
    setSectionName((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (section: SectionDisplay) => {
    setEditingSection(section);
    setIsEditing(true);
    setSectionName({ year_and_section: section.year_and_section });
    setSelectedInstructorId(
      section.instructor_id ? section.instructor_id.toString() : ""
    );
    setIsPanelOpen(true);
  };
  const handleSubmit = async () => {
    if (!sectionName.year_and_section) {
      setErrors({ year_and_section: "Year and Section is required." });
      return;
    }

    setSidePanelLoading(true);
    setErrors({});

    const payload: SectionPayload = {
      year_and_section: sectionName.year_and_section,
      instructor_assigned: selectedInstructorId
        ? Number(selectedInstructorId)
        : null,
      loaded_course: loadedCourseId,
    };

    try {
      if (isEditing && editingSection) {
        await editSection(editingSection.id, payload);
      } else {
        await addSection(loadedCourseId, payload);
      }

      const { course_details, sections: updatedSections } = await getSections(
        loadedCourseId
      );
      setCourseDetails(course_details);
      setSections(
        mapAndSortSections(
          updatedSections.map((s) => ({
            id: s.id,
            year_and_section: s.year_and_section,
            instructor_assigned: s.instructor_assigned,
            instructor_id: s.instructor_id ?? null,
          }))
        )
      );

      resetPanelState();
    } catch (error: unknown) {
      console.error("Section save failed:", error);
      setErrors({ submit: "Something went wrong while saving the section." });
    } finally {
      setSidePanelLoading(false);
    }
  };

  const resetPanelState = () => {
    setIsPanelOpen(false);
    setEditingSection(null);
    setIsEditing(false);
    setSidePanelLoading(false);
    setSectionName({ year_and_section: "" });
    setSelectedInstructorId("");
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    const success = await deleteSection(Number(id));
    if (success) setSections((prev) => prev.filter((u) => u.id !== id));
  };

  const goToDepartmentChairAssessmentPage = (section: SectionDisplay) => {
    navigate(
      `/department/${department_id}/${department_name}/${loaded_course_id}/${course_code}/${section.year_and_section}`
    );
  };

  if (!currentUserId) {
    return <div>Unauthorized: No user logged in.</div>;
  }

  if (!sections) {
    return <div>Loading course details...</div>;
  }

  return (
    <AppLayout activeItem={`/department/${department_id}/${department_name}`}>
      {courseDetails && (
        <InfoComponent
          loading={loading}
          title={courseDetails.course_title}
          subtitle={`${courseDetails.academic_year} ${courseDetails.semester_type} | ${courseDetails.year_level}`}
          details={`Department of ${courseDetails.department_name} | ${courseDetails.college_name} | ${courseDetails.campus_name} Campus`}
        />
      )}{" "}
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
          onEdit={(id) => {
            const section = sections.find((s) => s.id === Number(id));
            if (section) handleEditClick(section);
          }}
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
          onEdit={(id) => {
            const section = sections.find((s) => s.id === Number(id));
            if (section) handleEditClick(section);
          }}
          onDelete={handleDelete}
          loading={loading}
          skeletonRows={2}
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={resetPanelState}
        panelFunction={isEditing ? "Edit Section" : "Add Section"}
        onSubmit={handleSubmit}
        buttonFunction={isEditing ? "Update Section" : "Add Section"}
        loading={sidePanelLoading}
      >
        <UserInputComponent
          label="Year and Section"
          name="year_and_section"
          required
          error={errors.year_and_section}
          value={sectionName.year_and_section}
          onChange={handlesInputChange}
          loading={sidePanelLoading}
          onClearError={handleClearError}
        />
        <DropdownComponent
          label="Instructor Assigned"
          name="instructor_assigned"
          options={instructorOptions}
          value={selectedInstructorId}
          onChange={(_, val) => setSelectedInstructorId(val)}
          loading={sidePanelLoading}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
