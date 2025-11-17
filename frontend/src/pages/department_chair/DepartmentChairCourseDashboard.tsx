import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import AppLayout from "../../layout/AppLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";
import { useAuth } from "../../context/useAuth";
import { useMemo, useState, useEffect } from "react";
import PlusIcon from "../../assets/plus-solid.svg?react";
import SidePanelComponent from "../../components/SidePanelComponent";
import DropdownComponent from "../../components/DropDownComponent";
import { useNavigate, useParams } from "react-router-dom";
import { useDepartment } from "../../context/useDepartment";
import type { AcademicYear } from "../../types/dropdownTypes";
import { getAcademicYears } from "../../api/dropdownApi";
import {
  getDepartmentLoadedCourses,
  getDepartmentCourses,
  addLoadedCourse,
  deleteLoadedCourse,
} from "../../api/departmentChairLoadedCourseApi";
import type {
  DepartmentCourseErrorResponse,
  DepartmentCourses,
  LoadDepartmentCourse,
} from "../../types/departmentChairLoadedCourseTypes";
import DepartmentCoursesTableComponent from "../../components/DepartmentCoursesTableComponent";
import InfoComponent from "../../components/InfoComponent";
import ProgramOutcomesTableComponent from "../../components/ProgramOutcomesTableComponent";
import type { BaseLoadedCourse } from "../../types/baseTypes";
import type { AxiosError } from "axios";

export default function DepartmentChairCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("courses");
  const { layout } = useLayout();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { department_id, department_name } = useParams();
  const { department } = useDepartment();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [ayLoaded, setAyLoaded] = useState(false);
  const [loadedCoursesFetched, setLoadedCoursesFetched] = useState(false);
  const [deptCoursesFetched, setDeptCoursesFetched] = useState(false);
  const [departmentLoadedCourses, setDepartmentLoadedCourses] = useState<
    BaseLoadedCourse[]
  >([]);
  const [departmentCourses, setDepartmentCourses] = useState<
    DepartmentCourses[]
  >([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);

  const [selectedCourses, setSelectedCourses] = useState<DepartmentCourses[]>(
    []
  );

  const [sidePanelLoading, setSidePanelLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const departmentId = user?.department_id ?? 0;
  const programId = department?.program_id ?? 0;

  useEffect(() => {
    if (ayLoaded) return;

    (async () => {
      try {
        const years = await getAcademicYears();
        setAcademicYears(years);
        setAyLoaded(true);
      } catch (err) {
        console.error("Error fetching AY:", err);
      }
    })();
  }, [ayLoaded]);

  useEffect(() => {
    if (activeMenu !== "courses") return;
    if (loadedCoursesFetched) return;

    let active = true;
    setLoading(true);

    (async () => {
      try {
        const loadedCourses = await getDepartmentLoadedCourses(departmentId);
        if (!active) return;
        setDepartmentLoadedCourses(loadedCourses);
        setLoadedCoursesFetched(true);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [activeMenu, departmentId, loadedCoursesFetched]);

  useEffect(() => {
    if (!isPanelOpen) return;
    if (deptCoursesFetched) return;

    let active = true;
    setSidePanelLoading(true);

    (async () => {
      try {
        const courses = await getDepartmentCourses(departmentId);
        if (!active) return;
        setDepartmentCourses(courses);
        setDeptCoursesFetched(true);
      } finally {
        setSidePanelLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isPanelOpen, departmentId, deptCoursesFetched]);

  const handleClearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const academicYearOptions = useMemo(() => {
    return academicYears.map((ay) => ({
      label: `${ay.academic_year_start} - ${ay.academic_year_end}`,
      value: ay.academic_year_id.toString(),
    }));
  }, [academicYears]);

  const filteredDepartmentCourses = useMemo(() => {
    if (!searchQuery.trim()) return departmentCourses;

    const query = searchQuery.toLowerCase();
    return departmentCourses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query) ||
        course.lecture_unit.toString().includes(query) ||
        course.laboratory_unit.toString().includes(query) ||
        course.credit_unit.toString().includes(query)
    );
  }, [departmentCourses, searchQuery]);

  const filteredDepartmentLoadedCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return departmentLoadedCourses;

    return departmentLoadedCourses.filter((course) => {
      const academicYearAndSem =
        `${course.academic_year_start}-${course.academic_year_end} / ${course.semester_type}`.toLowerCase();

      return (
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query) ||
        academicYearAndSem.includes(query)
      );
    });
  }, [departmentLoadedCourses, searchQuery]);

  const handleLoadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitLoading(true); // <<< use submitLoading, not sidePanelLoading

    const newErrors: { [key: string]: string } = {};
    if (!selectedAcademicYear) {
      newErrors.academic_year = "Academic Year is required.";
    }
    if (selectedCourses.length === 0) {
      newErrors.courses = "Please select at least one course to load.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitLoading(false);
      return;
    }

    const duplicateCourseCodes: string[] = [];

    try {
      const academicYearId = selectedAcademicYear!;

      for (const course of selectedCourses) {
        const courseCode = course.course_code?.replace(/\s+/g, "") ?? "";
        const loadCourse: LoadDepartmentCourse = {
          course: courseCode,
          academic_year: parseInt(academicYearId, 10),
        };

        try {
          await addLoadedCourse(departmentId, loadCourse);
        } catch (err) {
          const axiosErr = err as AxiosError<DepartmentCourseErrorResponse>;
          const status = axiosErr.response?.status;
          const data = axiosErr.response?.data;

          if (status === 400 && data?.code === "course_already_loaded") {
            duplicateCourseCodes.push(course.course_code);
            continue;
          }

          throw err;
        }
      }

      const updatedCourses = await getDepartmentLoadedCourses(departmentId);
      setDepartmentLoadedCourses(updatedCourses);

      if (duplicateCourseCodes.length > 0) {
        const msg =
          duplicateCourseCodes.length === 1
            ? `This course is already loaded for the given academic year: ${duplicateCourseCodes[0]}.`
            : `These courses are already loaded for the given academic year: [${duplicateCourseCodes.join(
                ", "
              )}].`;

        setErrors((prev) => ({
          ...prev,
          courses: msg,
        }));
      } else {
        resetPanelState();
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      const axiosErr = error as AxiosError<DepartmentCourseErrorResponse>;
      const backendMessage = axiosErr.response?.data?.message;

      setErrors((prev) => ({
        ...prev,
        courses:
          backendMessage ??
          "An unexpected error occurred while loading the courses.",
      }));
    } finally {
      setSubmitLoading(false); 
    }
  };

  const resetPanelState = () => {
    setIsPanelOpen(false);
    setSelectedCourses([]);
    setSelectedAcademicYear(null);
    setErrors({});
    setSidePanelLoading(false);
    setSubmitLoading(false);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteLoadedCourse(id);

    if (success)
      setDepartmentLoadedCourses((prev) => prev.filter((u) => u.id !== id));
  };

  const goToDepartmentChairCoursePage = (course: BaseLoadedCourse) => {
    const loadedCourseId = course.id;
    const courseCode = course.course_code?.replace(/\s+/g, "") ?? "";

    navigate(`/department/${department_id}/${loadedCourseId}`, {
      state: {
        course_code: courseCode,
        department_name: department_name,
      },
    });
  };

  return (
    <AppLayout activeItem={`/department/${department_id}`}>
      <InfoComponent
        loading={loading}
        title={`Department of ${department?.department_name ?? ""}`}
        subtitle={`${department?.college_name ?? ""}`}
        details={`${department?.campus_name ?? ""} Campus`}
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "Courses",
            value: "courses",
            enableSearch: true,
            enableLayout: true,
            enableButton: true,
          },
          {
            label: "Program Outcomes",
            value: "outcomes",
            enableSearch: false,
            enableLayout: false,
            enableButton: false,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onButtonClick={() => setIsPanelOpen(true)}
        onTitleSelect={(value) => setActiveMenu(value)}
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        buttonLabel="Load Courses"
      />
      {activeMenu === "courses" ? (
        <>
          {layout === "cards" ? (
            <CardsGridComponent
              items={filteredDepartmentLoadedCourses}
              onCardClick={goToDepartmentChairCoursePage}
              onDelete={(course) => handleDelete(Number(course))}
              emptyImageSrc={emptyImage}
              emptyMessage="No Courses Available!"
              aspectRatio="20/9"
              fieldTop={(c) => c.course_code}
              title={(c) => c.course_title}
              subtitle={(course) => {
                const academicYearAndSem = `${course.academic_year_start}-${course.academic_year_end} | ${course.semester_type}`;
                return `${academicYearAndSem} | ${course.program_name ?? ""}`;
              }}
              loading={loading}
              enableOption
              disableEdit
            />
          ) : (
            <TableComponent
              data={filteredDepartmentLoadedCourses}
              onRowClick={goToDepartmentChairCoursePage}
              emptyImageSrc={emptyImage}
              emptyMessage="No Courses Available!"
              columns={[
                { key: "course_code", label: "Code" },
                { key: "course_title", label: "Course Title" },
                { key: "program_name", label: "Program" },
                {
                  key: "academic_year_and_semester",
                  label: "Academic Year / Semester",
                },
                { key: "year_level_type", label: "Year Level" },
              ]}
              onDelete={(course) => handleDelete(Number(course))}
              loading={loading}
              showActions
              disableEdit
            />
          )}
        </>
      ) : activeMenu === "outcomes" ? (
        <div className="pb-20 pt-8 flex flex-col gap-4">
          <span>
            Upon completion of the {department?.program_name}, graduates are
            able to:
          </span>
          <ProgramOutcomesTableComponent programId={programId} />
        </div>
      ) : null}

      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={resetPanelState}
        panelFunction="Load Courses"
        onSubmit={handleLoadCourse}
        buttonFunction="Load Courses"
        singleColumn
        loading={sidePanelLoading || submitLoading}
        disableSubmit={departmentCourses.length === 0 || submitLoading}
      >
        <div className="mb-4">
          <DepartmentCoursesTableComponent
            courses={filteredDepartmentCourses}
            selectedCourses={selectedCourses.map((c) => c.course_code)}
            onSelectionChange={(codes) => {
              setSelectedCourses(
                departmentCourses.filter((c) => codes.includes(c.course_code))
              );
            }}
            loading={sidePanelLoading}
            error={errors.courses}
            onClearError={handleClearError}
          />
        </div>

        <div className="mb-4">
          <DropdownComponent
            label="Academic Year"
            name="academic_year"
            required
            error={errors.academic_year}
            options={academicYearOptions}
            value={selectedAcademicYear ?? ""}
            onChange={(_, value) => setSelectedAcademicYear(value)}
            loading={sidePanelLoading}
            onClearError={handleClearError}
          />
        </div>
      </SidePanelComponent>
    </AppLayout>
  );
}
