// src/pages/dean/DeanCoursePage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../layout/AppLayout";
import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";

import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";

import { fetchDeanCoursePage } from "../../api/deanDashboardApi";
import type {
  DeanCoursePageResponse,
  SectionDisplay,
} from "../../types/deanDashboardTypes";

export default function DeanCoursePage() {
  const { department_id, loaded_course_id } = useParams();
  const navigate = useNavigate();
  const { layout } = useLayout();

  const [courseData, setCourseData] = useState<DeanCoursePageResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!loaded_course_id) return;

      try {
        setLoading(true);
        const data = await fetchDeanCoursePage(Number(loaded_course_id));
        setCourseData(data);
      } catch (e) {
        console.error("Failed to fetch dean course page data", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [loaded_course_id]);

  const filteredSections = useMemo(() => {
    if (!courseData) return [];

    const q = searchQuery.trim().toLowerCase();

    return courseData.sections
      .filter(
        (s) =>
          s.year_and_section.toLowerCase().includes(q) ||
          s.instructor_assigned.toLowerCase().includes(q)
      )
      .map((s) => ({ ...s, id: s.id }));
  }, [courseData, searchQuery]);

  const goToAssessmentPage = (section: SectionDisplay) => {
    if (!loaded_course_id || !department_id) return;

    navigate(`/college/${department_id}/${loaded_course_id}/${section.id}`, {
      state: {
        course_code: courseData?.course_details.course_code ?? "",
        year_and_section: section.year_and_section,
      },
    });
  };

  if (!courseData) {
    return (
      <AppLayout activeItem={`/college/${department_id}`}>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  const details = courseData.course_details;

  return (
    <AppLayout activeItem={`/college/${department_id}`}>
      <InfoComponent
        loading={loading}
        title={`${details.course_title}`}
        subtitle={`${details.academic_year} ${details.semester_type} | ${details.year_level}`}
        details={`Department of ${details.department_name} | ${details.college_name} | ${details.campus_name} Campus`}
      />

      <ToolBarComponent
        titleOptions={[
          {
            label: "Sections",
            value: "sections",
            enableSearch: true,
            enableLayout: true,
            enableButton: false,
          },
        ]}
        onSearch={(v) => setSearchQuery(v)}
      />

      {layout === "cards" ? (
        <CardsGridComponent
          items={filteredSections}
          onCardClick={goToAssessmentPage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Sections Available!"
          aspectRatio="20/9"
          loading={loading}
          fieldTop={(s) => s.year_and_section}
          title={(s) => s.instructor_assigned}
          subtitle={() => "Instructor Assigned"}
        />
      ) : (
        <TableComponent
          data={filteredSections}
          onRowClick={goToAssessmentPage}
          emptyImageSrc={emptyImage}
          emptyMessage="No Sections Available!"
          loading={loading}
          columns={[
            { key: "year_and_section", label: "Section" },
            { key: "instructor_assigned", label: "Instructor Assigned" },
          ]}
        />
      )}
    </AppLayout>
  );
}
