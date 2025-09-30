import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLayout } from "../../context/useLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import RightArrowIcon from "../../assets/arrow-right-solid.svg?react";
import FileImport from "../../assets/file-import-solid.svg?react";
import AppLayout from "../../layout/AppLayout"; 
import { useAuth } from "../../context/useAuth";
import { fetchCourseDetails } from "../../api/instructorDashboardApi";
import type { SectionItem, CourseDetailsWithSections } from "../../types/instructorDashboardTypes";

export default function CoursePage() {
  const [activeMenu, setActiveMenu] = useState("section");
  const [searchQuery, setSearchQuery] = useState("");
  const { loaded_course_id, course_code } = useParams();
  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();

  const [courseDetails, setCourseDetails] = useState<CourseDetailsWithSections[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.user_id ?? null;

  useEffect(() => {
    const loadCourse = async () => {
      if (!loaded_course_id || !currentUserId) return;

      try {
        setLoading(true);
        const data = await fetchCourseDetails(Number(currentUserId), Number(loaded_course_id));
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
  return courseDetails.filter(
    (section) =>
      section.year_and_section.toLowerCase().includes(query) ||
      section.instructor_assigned.toLowerCase().includes(query)
  );
}, [courseDetails, searchQuery]);

  //   const filteredCourses = useMemo(() => {
  //   if (!searchQuery.trim()) return courses;

  //   const query = searchQuery.toLowerCase();
  //   return courses.filter(
  //     (course) =>
  //       course.course_code.toLowerCase().includes(query) ||
  //       course.course_title.toLowerCase().includes(query)
  //   );
  // }, [searchQuery, courses]);

  const goToClassRecord = (item: SectionItem) => {
    if (!loaded_course_id || !course_code) return;
    navigate(
      `/instructor/${loaded_course_id}/${course_code}/${item.year_and_section}`
    );
  };

  if (!currentUserId) {
    return <div>Unauthorized: No instructor logged in.</div>;
  }

  if (loading) { return <div>Loading course details...</div>; }
  
  if (!loaded_course_id || !courseDetails) {
    return <div>Loading course details...</div>;
  }

  return (
    <AppLayout activeItem="/instructor">
      {courseDetails.length > 0 && (
        <InfoComponent
          title={courseDetails[0].course_title}
          subtitle={`${courseDetails[0].academic_year} ${
            courseDetails[0].semester_type ?? "N/A"
          } | ${courseDetails[0].year_level ?? "N/A"}`}
          details={`Department of ${courseDetails[0].department_name ?? "N/A"} | ${
            courseDetails[0].college_name ?? "N/A"
          } | ${courseDetails[0].campus_name ?? "N/A"} Campus`}
        />
      )}

      <ToolBarComponent
        titleOptions={[
          {
            label: "Section",
            value: "section",
            enableSearch: true,
            enableLayout: true,
            enableButton: false,
          },
          {
            label: "Mapping",
            value: "mapping",
            enableSearch: false,
            enableLayout: false,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onTitleSelect={(val) => setActiveMenu(val)}
        buttonLabel="Generate Suggested Mapping"
        buttonIcon={<RightArrowIcon className="h-5 w-5 text-white" />}
        onButtonClick={() => console.log("Button clicked!")}
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
              columns={[
                { key: "year_and_section", label: "Section" },
                { key: "instructor_assigned", label: "Instructor Assigned" },
              ]}
              onEdit={(id) => console.log("Edit course", id)}
            />
          )}
        </>
      )}

      {activeMenu === "mapping" && (
        <div className="flex flex-col gap-8 my-8">
          <p className="text-sm">
            The NLP-driven Course Outcome to Program Outcome (CO-PO) Mapping in
            the following table suggests potential alignments between Course
            Outcomes (COs) and Program Outcomes (POs). The generated mappings
            are intended to serve as guidance for instructors and remain subject
            to their discretion, as they may possibly produce inaccuracies.
          </p>
          <button
            onClick={() => console.log("clicked")}
            className="h-32 border cursor-pointer rounded-lg border-[#E9E6E6] w-full flex flex-col items-center justify-center gap-4"
          >
            <FileImport className="h-12" />
            <span className="text-[#767676] text-sm">
              Upload Course Syllabus in PDF Format
            </span>
          </button>
        </div>
      )}
    </AppLayout>
  );
}
