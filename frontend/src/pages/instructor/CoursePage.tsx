import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import AppLayout from "../../layout/AppLayout";
import { useAuth } from "../../context/useAuth";
import { fetchCourseDetails } from "../../api/instructorDashboardApi";
import type { CourseDetailsWithSections } from "../../types/instructorDashboardTypes";
import ProgramOutcomesDisplayTable from "../../components/ProgramOutcomesDisplayTableComponent";
import { useDepartment } from "../../context/useDepartment";
import CourseOutcomesTableComponent from "../../components/CourseOutcomesTableComponent";
import OutcomeMappingTableComponent from "../../components/OutcomeMappingTableComponent";

export default function CoursePage() {
  const [activeMenu, setActiveMenu] = useState("section");
  const [searchQuery, setSearchQuery] = useState("");
  const { loaded_course_id, course_code } = useParams();
  const { department } = useDepartment();
  const programId = department?.program_id ?? 0;
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();

  const [courseDetails, setCourseDetails] = useState<
    CourseDetailsWithSections[]
  >([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.user_id ?? null;

  useEffect(() => {
    const loadCourse = async () => {
      if (!loaded_course_id || !currentUserId) return;

      try {
        setLoading(true);
        const data = await fetchCourseDetails(
          Number(currentUserId),
          Number(loaded_course_id)
        );
        setCourseDetails(data);
      } catch (error) {
        console.error("Failed to fetch course details", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [loaded_course_id, currentUserId]);

  const filteredSections = useMemo(() => {
    if (!courseDetails) return [];

    const query = searchQuery.toLowerCase();
    return courseDetails
      .filter(
        (section) =>
          section.year_and_section.toLowerCase().includes(query) ||
          section.instructor_assigned.toLowerCase().includes(query)
      )
      .map((section) => ({
        ...section,
        id: section.section_id,
      }));
  }, [courseDetails, searchQuery]);

  const goToClassRecord = (item: CourseDetailsWithSections) => {
    if (!loaded_course_id || !course_code) return;

    navigate(
      `/instructor/${loaded_course_id}/${course_code}/${item.section_id}/${item.year_and_section}`
    );
  };

  if (!currentUserId) {
    return <div>Unauthorized: No instructor logged in.</div>;
  }

  if (!loaded_course_id || !courseDetails) {
    return <div>Loading course details...</div>;
  }

  return (
    <AppLayout activeItem="/instructor">
      <InfoComponent
        loading={loading}
        title={courseDetails[0]?.course_title ?? ""}
        subtitle={
          courseDetails.length > 0
            ? `${courseDetails[0].academic_year} ${
                courseDetails[0].semester_type ?? "N/A"
              } | ${courseDetails[0].year_level ?? "N/A"}`
            : ""
        }
        details={
          courseDetails.length > 0
            ? `Department of ${courseDetails[0].department_name ?? "N/A"} | ${
                courseDetails[0].college_name ?? "N/A"
              } | ${courseDetails[0].campus_name ?? "N/A"} Campus`
            : ""
        }
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "My Sections",
            value: "section",
            enableSearch: true,
            enableLayout: true,
            enableButton: false,
          },
          {
            label: "Outcome Mapping",
            value: "mapping",
            enableSearch: false,
            enableLayout: false,
            enableButton: false,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onTitleSelect={(val) => setActiveMenu(val)}
      />
      {activeMenu === "section" && (
        <>
          {layout === "cards" ? (
            <CardsGridComponent
              items={filteredSections}
              onCardClick={goToClassRecord}
              emptyImageSrc={emptyImage}
              emptyMessage="No Sections Available!"
              aspectRatio="20/9"
              loading={loading}
              fieldTop={(section) => section.year_and_section}
              title={(section) => section.instructor_assigned}
              subtitle={() => "Instructor Assigned"}
            />
          ) : (
            <TableComponent
              data={filteredSections}
              onRowClick={goToClassRecord}
              emptyImageSrc={emptyImage}
              emptyMessage="No Sections Available!"
              loading={loading}
              columns={[
                { key: "year_and_section", label: "Section" },
                { key: "instructor_assigned", label: "Instructor Assigned" },
              ]}
            />
          )}
        </>
      )}

      {activeMenu === "mapping" && (
        <div className="pb-20 pt-12 flex flex-col gap-16">
          <div className="flex flex-col gap-8">
            <div className="gap-2">
              <h2 className="text-xl">Program Outcomes</h2>
              <span className="text-gray-500">
                Upon completion of the {department?.program_name}, graduates are
                able to:
              </span>
            </div>
            <ProgramOutcomesDisplayTable programId={programId} />
          </div>
          <div className="flex flex-col gap-8">
            <div className="gap-2">
              <h2 className="text-xl">Course Outcomes</h2>
              <span className="text-gray-500">
                Upon completion of the {course_code} course, students are able
                to:
              </span>
            </div>
            <CourseOutcomesTableComponent
              loadedCourseId={Number(loaded_course_id)}
            />
          </div>
          <div className="flex flex-col gap-8">
            <h2 className="text-xl">Outcome Mapping</h2>
            <OutcomeMappingTableComponent loadedCourseId={Number(loaded_course_id)} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
