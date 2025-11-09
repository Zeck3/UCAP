// import InfoComponent from "../../components/InfoComponent";
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

import type { AcademicYear } from "../../types/dropdownTypes";
import { getAcademicYears } from "../../api/dropdownApi";
import {
  getDepartmentLoadedCourses,
  getDepartmentCourses,
  addLoadedCourse,
  deleteLoadedCourse,
} from "../../api/departmentChairLoadedCourseApi";
import type {
  DepartmentCourses,
  DepartmentLoadedCoursesDisplay,
  LoadDepartmentCourse,
} from "../../types/departmentChairLoadedCourseTypes";
import DepartmentCoursesTableComponent from "../../components/DepartmentCoursesTableComponent";

export default function DepartmentChairCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState("courses");
  const { layout } = useLayout();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { department_id, department_name } = useParams();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [departmentLoadedCourses, setDepartmentLoadedCourses] = useState<
    DepartmentLoadedCoursesDisplay[]
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

  const departmentId = user?.department_id ?? 0;

  useEffect(() => {
    async function fetchDepartmentDetailsData() {
      setLoading(true);
      try {
        const [loadedCourses, allCourses, years] = await Promise.all([
          getDepartmentLoadedCourses(departmentId),
          getDepartmentCourses(departmentId),
          getAcademicYears(),
        ]);
        setDepartmentLoadedCourses(loadedCourses);
        setDepartmentCourses(allCourses);
        setAcademicYears(years);
      } catch (err) {
        console.error("Error loading department data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartmentDetailsData();
  }, [departmentId]);

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
    if (!searchQuery.trim()) return departmentLoadedCourses;

    const query = searchQuery.toLowerCase();
    return departmentLoadedCourses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query) ||
        course.academicYearAndSem.toLowerCase().includes(query)
    );
  }, [departmentLoadedCourses, searchQuery]);

  const handleLoadCourse = async () => {
    setErrors({});
    setSidePanelLoading(true);

    const newErrors: { [key: string]: string } = {};
    if (!selectedAcademicYear) {
      newErrors.academic_year = "Academic Year is required.";
    }
    if (selectedCourses.length === 0) {
      newErrors.courses = "Please select at least one course to load.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSidePanelLoading(false);
      return;
    }

    try {
      for (const course of selectedCourses) {
        const courseCode = course.course_code?.replace(/\s+/g, "") ?? "";
        const academicYearId = selectedAcademicYear ?? "";
        const loadCourse: LoadDepartmentCourse = {
          course: courseCode,
          academic_year: parseInt(academicYearId),
        };
        await addLoadedCourse(departmentId, loadCourse);
      }

      const updatedCourses = await getDepartmentLoadedCourses(departmentId);
      setDepartmentLoadedCourses(updatedCourses);
      resetPanelState();
    } catch (error) {
      console.error("Error loading courses:", error);
      setErrors({ submit: "An error occurred while loading the courses." });
    } finally {
      setSidePanelLoading(false);
    }
  };

  const resetPanelState = () => {
    setIsPanelOpen(false);
    setSelectedCourses([]);
    setSelectedAcademicYear(null);
    setErrors({});
    setSidePanelLoading(false);
  };

  const handleDelete = async (id: number) => {
    const success = await deleteLoadedCourse(id);

    if (success)
      setDepartmentLoadedCourses((prev) => prev.filter((u) => u.id !== id));
  };

  const goToDepartmentChairCoursePage = (
    course: DepartmentLoadedCoursesDisplay
  ) => {
    const loadedCourseId = course.id;
    const courseCode = course.course_code?.replace(/\s+/g, "") ?? "";
    navigate(
      `/department/${department_id}/${department_name}/${loadedCourseId}/${courseCode}`
    );
  };

  return (
    <AppLayout activeItem={`/department/${department_id}/${department_name}`}>
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
                const semesterText = course.semester_type
                  ? course.semester_type
                      .toLowerCase()
                      .replace("semester", "sem")
                      .trim()
                  : "N/A";
                return `${course.academic_year ?? "N/A"} ${semesterText} | ${
                  course.program_name ?? ""
                }`;
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
                { key: "academicYearAndSem", label: "Academic Year & Sem" },
                { key: "year_level", label: "Year Level" },
              ]}
              onDelete={(course) => handleDelete(Number(course))}
              loading={loading}
              showActions
              disableEdit
            />
          )}
        </>
      ) : activeMenu === "outcomes" ? (
        <div className="text-center text-gray-600 py-8">
          Program Outcomes view goes here
        </div>
      ) : null}

      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={resetPanelState}
        panelFunction="Load Courses"
        onSubmit={handleLoadCourse}
        buttonFunction="Load Courses"
        singleColumn
        loading={sidePanelLoading}
      >
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
      </SidePanelComponent>
    </AppLayout>
  );
}
