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
import FileImport from "../../assets/file-import-solid.svg?react";
import { fetchCourseDetails } from "../../api/instructorDashboardApi";
import type {
  AssignedSection,
  CourseDetailsWithSections,
} from "../../types/instructorDashboardTypes";
import ProgramOutcomesDisplayTable from "../../components/ProgramOutcomesDisplayTableComponent";
import { useDepartment } from "../../context/useDepartment";
import CourseOutcomesTableComponent from "../../components/CourseOutcomesTableComponent";
import OutcomeMappingTableComponent from "../../components/OutcomeMappingTableComponent";
import GearsSolid from "../../assets/gears-solid-full.svg?react";
import EvilDog from "../../assets/undraw_page-eaten.svg?react";

export default function CoursePage() {
  const [activeMenu, setActiveMenu] = useState("section");
  const [searchQuery, setSearchQuery] = useState("");
  const { loaded_course_id, course_code } = useParams();
  const [refreshMappingKey, setRefreshMappingKey] = useState(0);
  const { department } = useDepartment();
  const programId = department?.program_id ?? 0;
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();

  const [courseDetails, setCourseDetails] =
    useState<CourseDetailsWithSections | null>(null);
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

    return courseDetails.sections
      .filter(
        (section) =>
          section.year_and_section.toLowerCase().includes(query) ||
          (section.instructor_assigned ?? "").toLowerCase().includes(query)
      )
      .map((section) => ({
        ...section,
        id: section.section_id,
      }));
  }, [courseDetails, searchQuery]);

  const goBack = () => {
    navigate(-1);
  };

  const goToClassRecord = (item: AssignedSection) => {
    if (!loaded_course_id) return;

    navigate(`/instructor/${loaded_course_id}/${item.section_id}`, {
      state: {
        course_code: courseDetails?.course_details.course_code ?? "",
        year_and_section: item.year_and_section,
      },
    });
  };

  const handleCourseOutcomesChanged = () => {
    setRefreshMappingKey((prev) => prev + 1);
  };

  if (!currentUserId) {
    return <div>Unauthorized: No instructor logged in.</div>;
  }

  if (!loading && !courseDetails) {
    return (
      <AppLayout activeItem="/instructor">
        <div className="flex flex-col gap-4 justify-center items-center pt-8">
          <EvilDog />
          <span className="text-[#C6C6C6]">
            Course not found or you are not assigned to this loaded course.
          </span>
          <button
            onClick={goBack}
            className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-6 py-2.5 rounded-full cursor-pointer transition text-base flex items-center gap-2"
          >
            Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!loading && courseDetails?.sections.length === 0) {
    return (
      <AppLayout activeItem="/instructor">
        <div className="flex flex-col gap-4 justify-center items-center pt-16">
          <EvilDog />
          <span className="text-[#C6C6C6] text-center">
            Course not found or you are not assigned to any section <br /> of
            this course.
          </span>
          <button
            onClick={goBack}
            className="bg-ucap-yellow bg-ucap-yellow-hover text-white px-6 py-2.5 rounded-full cursor-pointer transition text-base flex items-center gap-2"
          >
            Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeItem="/instructor">
      <InfoComponent
        loading={loading}
        title={courseDetails?.course_details.course_title ?? ""}
        subtitle={
          courseDetails
            ? `${courseDetails.course_details.academic_year} ${courseDetails.course_details.semester_type} | ${courseDetails.course_details.year_level}`
            : ""
        }
        details={
          courseDetails
            ? `Department of ${courseDetails.course_details.department_name} | ${courseDetails.course_details.college_name} | ${courseDetails.course_details.campus_name} Campus`
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
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onTitleSelect={(val) => setActiveMenu(val)}
        buttonLabel="Upload Course Syllabus"
        onButtonClick={() => {
          alert("Feature coming soon!");
        }}
        buttonIcon={<FileImport className="w-5 h-5" />}
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
              title={(section) =>
                section.instructor_assigned || "NO INSTRUCTOR ASSIGNED"
              }
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
          {/* Program Outcomes */}
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

          {/* Course Outcomes */}
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
              onCourseOutcomesChanged={handleCourseOutcomesChanged} // new prop
            />
          </div>

          {/* Outcome Mapping */}
          <div className="flex flex-col gap-8">
            <h2 className="text-xl">Outcome Mapping</h2>
            <OutcomeMappingTableComponent
              key={refreshMappingKey} // triggers re-mount/re-fetch
              loadedCourseId={Number(loaded_course_id)}
            />
          </div>

          <div className="flex flex-col gap-8">
            <p className="text-sm">
              The NLP-driven Course Outcome to Program Outcome (CO-PO) Mapping
              in the following table suggests potential alignments between
              Course Outcomes (COs) and Program Outcomes (POs). The generated
              mappings are intended to serve as guidance for instructors and
              remain subject to their discretion.
            </p>
            <button
              onClick={() => {
                alert("Feature coming soon!");
              }}
              className="py-4 border cursor-pointer rounded-lg bg-ucap-yellow bg-ucap-yellow-hover border-[#FCB315] w-full flex flex-row items-center justify-center gap-4"
            >
              <GearsSolid className="w-8 h-8 text-white" />
              <span className="text-white text-base">
                Perform Course Outcome to Program Outcome Mapping
              </span>
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
