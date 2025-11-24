// src/pages/vcaa/CampusCoursePage.tsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppLayout from "../../layout/AppLayout";
import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";

import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";

import { fetchVcaaCoursePage } from "../../api/vcaaDashboardApi";
import type {} from "../../types/campusLoadedCourseTypes";
import type {
  BaseCoursePageResponse,
  BaseSection,
} from "../../types/baseTypes";

export default function VcaaCoursePage() {
  const { department_id, loaded_course_id } = useParams();
  const navigate = useNavigate();
  const { layout } = useLayout();

  const [courseData, setCourseData] = useState<BaseCoursePageResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!loaded_course_id) return;

      try {
        setLoading(true);
        const data = await fetchVcaaCoursePage(Number(loaded_course_id));
        setCourseData(data);
      } catch (e) {
        console.error("Failed to fetch campus course page data", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [loaded_course_id]);

  const filteredSections = useMemo(() => {
    if (!courseData) return [];

    const q = searchQuery.trim().toLowerCase();
    const courseCode = courseData?.course_details.course_code ?? "";

    const augmented = courseData.sections.map((s) => ({
      ...s,
      id: s.id,
      course_and_section: courseCode
        ? `${courseCode} - ${s.year_and_section}`
        : s.year_and_section,
    }));

    if (!q) return augmented;

    return augmented.filter((section) =>
      Object.values(section).some((val) => {
        if (val == null) return false;

        const t = typeof val;
        if (t === "string" || t === "number" || t === "boolean") {
          return String(val).toLowerCase().includes(q);
        }

        return false;
      })
    );
  }, [courseData, searchQuery]);

  const goToAssessmentPage = (section: BaseSection) => {
    if (!department_id || !loaded_course_id) return;

    navigate(`/campus/${department_id}/${loaded_course_id}/${section.id}`, {
      state: {
        course_code: courseData?.course_details.course_code ?? "",
        year_and_section: section.year_and_section,
      },
    });
  };

  const details = courseData?.course_details;

  return (
    <AppLayout activeItem={`/campus/${department_id}`}>
      <InfoComponent
        loading={loading}
        title={details?.course_title ?? ""}
        subtitle={
          details
            ? `${details.academic_year} ${details.semester_type} | ${details.year_level}`
            : ""
        }
        details={
          details
            ? `Department of ${details.department_name} | ${details.college_name} | ${details.campus_name} Campus`
            : ""
        }
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "Section Records",
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
          fieldTop="course_and_section"
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
            { key: "course_and_section", label: "Course & Section" },
            { key: "instructor_assigned", label: "Instructor Assigned" },
          ]}
        />
      )}
    </AppLayout>
  );
}
