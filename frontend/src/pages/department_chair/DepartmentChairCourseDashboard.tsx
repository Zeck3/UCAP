import InfoComponent from "../../components/InfoComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import TableComponent from "../../components/TableComponent";
import AppLayout from "../../layout/AppLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
import { useLayout } from "../../context/useLayout";
import { useAuth } from "../../context/useAuth";
import { useMemo, useState, useEffect, useCallback } from "react";
import PlusIcon from "../../assets/plus-solid.svg?react";
import SidePanelComponent from "../../components/SidePanelComponent";
import DropdownComponent from "../../components/DropDownComponent";
import { useNavigate, useParams } from "react-router-dom";
 
import type { AcademicYear } from "../../types/dropdownTypes";
import { getAcademicYears } from "../../api/dropdownApi";
import { fetchDepartmentLoadedCourses, fetchDepartmentDetails, fetchDeleteLoadedCourse, fetchDepartmentCourses, fetchLoadDepartmentCourse } from "../../api/departmentChairDashboardApi";
import type { DepartmentDetail, DepartmentLoadedCoursesDisplay, DepartmentCoursesDisplay, LoadDepartmentCourse } from "../../types/departmentChairDashboardTypes";

export default function DepartmentChairCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { layout } = useLayout();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { department_id, department_name } = useParams();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [departmentDetails, setDepartmentDetails] = useState<DepartmentDetail[]>([]);
  const [departmentLoadedCourses, setDepartmentLoadedCourses] = useState<DepartmentLoadedCoursesDisplay[]>([]);
  const [departmentCourses, setDepartmentCourses] = useState<DepartmentCoursesDisplay[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableKey, setTableKey] = useState(0);

  const [selectedCourses, setSelectedCourses] = useState<DepartmentCoursesDisplay[]>([]);

  const departmentId = user?.department_id ?? 0;

  useEffect(() => {
    async function fetchDepartmentDetailsData() {
      setLoading(true);
      const [details, courses, years, notLoaded] = await Promise.all([
        fetchDepartmentDetails(departmentId),
        fetchDepartmentLoadedCourses(departmentId),
        getAcademicYears(),
        fetchDepartmentCourses(departmentId),
      ]);
      setDepartmentDetails(details);
      setDepartmentLoadedCourses(courses);
      setAcademicYears(years);
      setLoading(false);
      setDepartmentCourses(notLoaded);
    }
    fetchDepartmentDetailsData();
  }, [departmentId]);


  const academicYearOptions = useMemo(() => {
    return academicYears.map((ay) =>  ({
    label: `${ay.academic_year_start} - ${ay.academic_year_end}`, 
    value: ay.academic_year_id.toString(),   
  }));
  }, [academicYears]);

  const filteredDepartmentCourses = useMemo(() => {
    if (!searchQuery.trim()) return departmentCourses;

    const query = searchQuery.toLowerCase();
    return departmentCourses.filter(
      (course) =>
        course.id.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query) ||
        course.lecture_unit.toString().includes(query) ||
        course.lab_unit.toString().includes(query) ||
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


  const handleSelectionChange = useCallback((selected: string[]) => {
    setSelectedCourses(
      departmentCourses.filter((course) => selected.includes(course.id))
    );
  }, [departmentCourses]);

  const handleLoadCourse = async () => {
  if (selectedCourses.length === 0) {
    alert("Please select at least one course.");
    return;
  }
  if (!selectedAcademicYear) {
    alert("Please select an academic year.");
    return;
  }
  try {
    for (const course of selectedCourses) {
      const courseCode = course.id?.replace(/\s+/g, "") ?? "";
      const academicYearId = selectedAcademicYear;

      const loadCourse: LoadDepartmentCourse = {
        course: courseCode,
        academic_year: parseInt(academicYearId),
      };

      await fetchLoadDepartmentCourse(loadCourse);

    }

    const updatedCourses = await fetchDepartmentLoadedCourses(departmentId);
    setDepartmentLoadedCourses(updatedCourses);

    // Close the side panel after loading
    setIsPanelOpen(false);
    setSelectedCourses([]);
    setSelectedAcademicYear(null);
    setTableKey((prev) => prev + 1);
    
  } catch (error) {
    console.error("Error loading courses:", error);
    alert("An error occurred while loading the courses.");
  }
};

  const handleDelete = async (id: number) => {
    const success = await fetchDeleteLoadedCourse(id);

    if (success) setDepartmentLoadedCourses((prev) => prev.filter((u) => u.id !== id));
    };


  const goToDepartmentChairCoursePage = (course: DepartmentLoadedCoursesDisplay) => {
    const departmentName = course.department_name?.replace(/\s+/g, "") ?? "";
    const loadedCourseId = course.id;
    const courseCode = course.course_code?.replace(/\s+/g, "") ?? "";
    navigate(`/department/${department_id}/${departmentName}/${loadedCourseId}/${courseCode}`);
  };

  return (
    <AppLayout activeItem={`/department/${department_id}/${department_name}`}>
      <InfoComponent
        loading={loading}
        title={`Department of ${departmentDetails.map(d => d.department_name).join(", ")}`}
        subtitle={departmentDetails.map(d => d.college_name).join(", ")}
        details={`${departmentDetails.map(d => d.campus_name).join(", ")} Campus`}
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "Department Courses",
            value: "courses",
            enableSearch: true,
            enableLayout: true,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        onButtonClick={() => setIsPanelOpen(true)}
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        buttonLabel="Load Courses"
      />
 
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
              ? course.semester_type.toLowerCase().replace("semester", "sem").trim()
              : "N/A";
            return `${course.academic_year ?? "N/A"} ${semesterText} | ${course.program_name ?? ""}`;
          }}
          loading={loading}
          enableOption
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
          onEdit={(course) => console.log("Edit course", course)}
          onDelete={handleDelete}
          loading={loading}
          
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Load Courses"
        onSubmit={handleLoadCourse}
        buttonFunction="Load Courses"
      >
        <div className="mb-4">
          <DropdownComponent
            label="Academic Year"
            name="academic_year"
            options={academicYearOptions}
            value={selectedAcademicYear ?? ""}
            onChange={(_, value) => setSelectedAcademicYear(value)}
          />
        </div>
        <div className="mb-4">
          <TableComponent
            key={tableKey}
            data={filteredDepartmentCourses}
            columns={[
              { key: "id", label: "Course Code" },
              { key: "course_title", label: "Course Title" },
              { key: "lecture_unit", label: "Lecture Unit" },
              { key: "lab_unit", label: "Lab Unit" },
              { key: "credit_unit", label: "Credit Unit" },
            ]}
            selectable
            onSelectionChange={handleSelectionChange}
            loading={loading}
            showActions={false}
          />
        </div>
      </SidePanelComponent>
    </AppLayout>
  );
}
