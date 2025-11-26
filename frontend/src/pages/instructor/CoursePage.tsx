import { useMemo, useState, useEffect, useCallback } from "react";
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
  BaseSection,
  BaseCoursePageResponse,
} from "../../types/baseTypes";
import ProgramOutcomesDisplayTable from "../../components/ProgramOutcomesDisplayTableComponent";
import CourseOutcomesTableComponent from "../../components/CourseOutcomesTableComponent";
import OutcomeMappingTableComponent from "../../components/OutcomeMappingTableComponent";
import GearsSolid from "../../assets/gears-solid-full.svg?react";
import EvilDog from "../../assets/undraw_page-eaten.svg?react";
import FileInstructionComponent from "../../components/FileInstructionComponent";
import { toast } from "react-toastify";
import { extractSyllabus } from "../../api/instructorDataExtractionApi";
import type { AxiosError } from "axios";
import type { OutcomeMappingResponse } from "../../types/outcomeMappingTypes";
import { getOutcomeMappings } from "../../api/OutcomeMappingApi";
import { fetchNlpOutcomeMapping } from "../../api/nlpOutcomeMappingApi";
import OutcomeMappingPredictionTable from "../../components/OutcomeMappingPredictionTable";
import axios from "axios";

type AugmentedSection = BaseSection & {
  id: number;
  combined_course_section: string;
};

export default function CoursePage() {
  const [activeMenu, setActiveMenu] = useState("section");
  const [searchQuery, setSearchQuery] = useState("");
  const { loaded_course_id } = useParams();
  const [refreshMappingKey, setRefreshMappingKey] = useState(0);
  const [refreshOutcomesKey, setRefreshOutcomesKey] = useState(0);
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);
  const [baseMappingData, setBaseMappingData] =
    useState<OutcomeMappingResponse | null>(null);

  const [nlpMappingData, setNlpMappingData] =
    useState<OutcomeMappingResponse | null>(null);

  const [nlpLoading, setNlpLoading] = useState(false);

  const { user } = useAuth();
  const { layout } = useLayout();
  const navigate = useNavigate();
  const [courseDetails, setCourseDetails] =
    useState<BaseCoursePageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const nlpCacheKey = loaded_course_id
    ? `nlp_mapping:${loaded_course_id}`
    : null;

  const currentUserId = user?.user_id ?? null;
  const programName = courseDetails?.course_details.program_name ?? "";
  const programId = courseDetails?.course_details.program_id ?? null;

  useEffect(() => {
    const loadCourse = async () => {
      if (!loaded_course_id || !currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setAccessError(null);

        const data = await fetchCourseDetails(
          Number(currentUserId),
          Number(loaded_course_id)
        );

        setCourseDetails(data);
      } catch (err) {
        const e = err as AxiosError<{ detail?: string; message?: string }>;
        setCourseDetails(null);

        setAccessError(
          e.response?.data?.detail ||
            e.response?.data?.message ||
            "Course not found or you are not assigned to this course."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [loaded_course_id, currentUserId]);

  const clearNlpCache = useCallback(() => {
    if (!nlpCacheKey) return;
    sessionStorage.removeItem(nlpCacheKey);
    setNlpMappingData(null);
  }, [nlpCacheKey]);

  useEffect(() => {
    if (activeMenu !== "mapping" || !loaded_course_id) return;

    (async () => {
      const data = await getOutcomeMappings(Number(loaded_course_id));
      try {
        if (!data.course_outcomes?.length || !data.program_outcomes?.length) {
          setBaseMappingData(data);
          clearNlpCache();
          return;
        }

        setBaseMappingData(data);
      } catch (e) {
        console.error("Failed to load base mapping data", e);
        setBaseMappingData(null);
      }
    })();
  }, [activeMenu, loaded_course_id, refreshMappingKey, clearNlpCache]);

  useEffect(() => {
    if (activeMenu !== "mapping" || !nlpCacheKey) return;

    const raw = sessionStorage.getItem(nlpCacheKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.mapping?.length > 0) {
        setNlpMappingData(parsed);
      }
    } catch {
      sessionStorage.removeItem(nlpCacheKey);
    }
  }, [activeMenu, nlpCacheKey]);

  useEffect(() => {
    if (!nlpCacheKey) return;

    if (nlpMappingData && nlpMappingData.mapping.length > 0) {
      sessionStorage.setItem(nlpCacheKey, JSON.stringify(nlpMappingData));
    } else {
      sessionStorage.removeItem(nlpCacheKey);
    }
  }, [nlpMappingData, nlpCacheKey]);

  const handleRunNlpMapping = async () => {
    if (!loaded_course_id || !baseMappingData) {
      toast.error("Load course/program outcomes first.");
      return;
    }

    if (
      !baseMappingData.course_outcomes?.length ||
      !baseMappingData.program_outcomes?.length
    ) {
      toast.error(
        "Cannot run NLP: missing course outcomes (COs) or program outcomes (POs)."
      );
      return;
    }

    setNlpLoading(true);
    const toastId = toast.loading("Running NLP mapping… please wait.");

    try {
      const pred = await fetchNlpOutcomeMapping(
        Number(loaded_course_id),
        baseMappingData.course_outcomes,
        baseMappingData.program_outcomes
      );

      setNlpMappingData(pred);

      toast.update(toastId, {
        render: "NLP mapping generated.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (e) {
      console.error("NLP mapping failed:", e);
      toast.update(toastId, {
        render: "Failed to run NLP mapping.",
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    } finally {
      setNlpLoading(false);
    }
  };

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const courseCode = courseDetails?.course_details?.course_code ?? "";
    const sections = courseDetails?.sections ?? [];

    const augmented: AugmentedSection[] = sections.map((section) => ({
      ...section,
      id: section.section_id,
      combined_course_section: courseCode
        ? `${courseCode} - ${section.year_and_section}`
        : section.year_and_section,
    }));

    if (!query) return augmented;

    return augmented.filter((section) =>
      Object.values(section).some((val) => {
        if (val == null) return false;
        const t = typeof val;
        if (t === "string" || t === "number" || t === "boolean") {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      })
    );
  }, [courseDetails, searchQuery]);

  const handleOpenSyllabusModal = () => {
    if (!loaded_course_id) {
      toast.error("Course not found.");
      return;
    }
    setShowSyllabusModal(true);
  };

  const handleCloseSyllabusModal = () => {
    if (isUploadingSyllabus) return;
    setShowSyllabusModal(false);
  };

  const handleSyllabusFileSelected = async (file: File | null) => {
    if (!file) return;
    if (!loaded_course_id) {
      toast.error("Course not found.");
      return;
    }

    setShowSyllabusModal(false);
    setIsUploadingSyllabus(true);

    const toastId = toast.loading("Extracting syllabus… please wait.");

    try {
      await extractSyllabus(Number(loaded_course_id), file);
      await refreshAfterSyllabus();

      toast.update(toastId, {
        render: "Syllabus uploaded and CO-PO mapping extracted.",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });
    } catch (err) {
      let message = "Failed to extract syllabus. Please check the PDF format.";

      if (axios.isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)
          ?.detail;
        if (detail) {
          message = detail;
        }
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 3500,
      });
    } finally {
      setIsUploadingSyllabus(false);
    }
  };

  const goToClassRecord = (item: AugmentedSection) => {
    if (!loaded_course_id) return;

    navigate(`/instructor/${loaded_course_id}/${item.section_id}`, {
      state: {
        course_code: courseDetails?.course_details.course_code ?? "",
        year_and_section: item.year_and_section,
      },
    });
  };

  const handleCourseOutcomesChanged = useCallback(() => {
    clearNlpCache();
    setRefreshMappingKey((prev) => prev + 1);
  }, [clearNlpCache]);

  const refreshAfterSyllabus = useCallback(() => {
    clearNlpCache();
    setRefreshOutcomesKey((prev) => prev + 1);
    setRefreshMappingKey((prev) => prev + 1);
  }, [clearNlpCache]);

  if (!currentUserId) {
    return <div>Unauthorized: No instructor logged in.</div>;
  }

  if (!loading && accessError) {
    return (
      <AppLayout activeItem="/instructor">
        <div className="flex flex-col gap-4 justify-center items-center pt-8">
          <EvilDog />
          <span className="text-[#C6C6C6] text-center">{accessError}</span>
          <button
            onClick={() => navigate(-1)}
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
            label: "My Records",
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
        onButtonClick={handleOpenSyllabusModal}
        buttonIcon={<FileImport className="w-5 h-5" />}
      />
      <FileInstructionComponent
        isOpen={showSyllabusModal}
        title="Upload Course Syllabus (PDF)"
        description="Select a syllabus PDF file for this course. The system will extract Course Outcomes (CO) and Outcome Mappings."
        instructions={[
          "Only .pdf files are allowed.",
          "Ensure the syllabus clearly lists Course Outcomes and the CO-PO mapping.",
          "Large PDFs may take a little time to process.",
        ]}
        accept=".pdf"
        primaryLabel="Choose PDF file"
        cancelLabel="Cancel"
        isProcessing={isUploadingSyllabus}
        onClose={handleCloseSyllabusModal}
        onFileSelected={handleSyllabusFileSelected}
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
              fieldTop={(section) => section.combined_course_section}
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
                { key: "combined_course_section", label: "Course & Section" },
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
              <span className="text-[#767676]">
                Upon completion of the {programName}, graduates are able to:
              </span>
            </div>
            <ProgramOutcomesDisplayTable programId={Number(programId)} />
          </div>

          <div className="flex flex-col gap-8">
            <div className="gap-2">
              <h2 className="text-xl">Course Outcomes</h2>
              <span>
                Upon completion of the{" "}
                {courseDetails?.course_details.course_code} course, students are
                able to:
              </span>
            </div>
            <CourseOutcomesTableComponent
              loadedCourseId={Number(loaded_course_id)}
              key={refreshOutcomesKey}
              onCourseOutcomesChanged={handleCourseOutcomesChanged}
            />
          </div>

          <div className="flex flex-col gap-8">
            <h2 className="text-xl">CO-PO Mapping</h2>
            <OutcomeMappingTableComponent
              key={refreshMappingKey}
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
            {(!nlpMappingData || nlpMappingData.mapping.length === 0) && (
              <button
                disabled={nlpLoading}
                onClick={handleRunNlpMapping}
                className="py-4 border cursor-pointer rounded-lg bg-ucap-yellow bg-ucap-yellow-hover border-[#FCB315] w-full flex flex-row items-center justify-center gap-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GearsSolid className="w-8 h-8 text-white" />
                <span className="text-white text-base">
                  Perform Course Outcome to Program Outcome Mapping
                </span>
              </button>
            )}
          </div>
          {nlpMappingData && nlpMappingData.mapping.length > 0 && (
            <div className="flex flex-col gap-8">
              <h2 className="text-xl">NLP Suggested CO-PO Mapping</h2>
              <OutcomeMappingPredictionTable data={nlpMappingData} />
              <div className="text-sm space-y-2 text-[#767676]">
                <p className="font-medium text-[#3E3E3E]">Legend</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <span className="font-semibold">
                      1 or{" "}
                      <span className="inline-block w-3 h-3 bg-[#C5E0B3] rounded-sm mr-1 align-middle" />
                      ={" "}
                    </span>
                    NLP suggests an alignment between the Course Outcome (CO)
                    and Program Outcome (PO).
                  </li>
                  <li>
                    <span className="font-semibold">0</span> = NLP does not
                    suggest an alignment.
                  </li>
                  <li>
                    Suggestions are guidance only; final CO–PO mapping should be
                    confirmed by the instructor.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
