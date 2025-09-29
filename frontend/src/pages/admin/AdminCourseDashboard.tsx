import { useMemo, useState, useEffect } from "react";
import {
  addCourse,
  deleteCourse,
  editCourse,
  getCourse,
  getCourses,
} from "../../api/courseManagementApi";
import {
  getPrograms,
  getSemesters,
  getYearLevels,
} from "../../api/dropdownApi";
import { useLayout } from "../../context/useLayout";
import ToolBarComponent from "../../components/ToolBarComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import emptyImage from "../../assets/undraw_file-search.svg";
import TableComponent from "../../components/TableComponent";
import CardsGridComponent from "../../components/CardsGridComponent";
import SidePanelComponent from "../../components/SidePanelComponent";
import UserInputComponent from "../../components/UserInputComponent";
import DropdownComponent from "../../components/DropDownComponent";
import AppLayout from "../../layout/AppLayout";
import type { Program, Semester, YearLevel } from "../../types/dropdownTypes";
import type {
  CourseFormData,
  CourseInfo,
  CourseInfoDisplay,
  CoursePayload,
} from "../../types/courseManagementTypes";

const initialFormData: CourseFormData = {
  course_code: "",
  course_title: "",
  program: "",
  year_level: "",
  semester: "",
  lecture_unit: "",
  laboratory_unit: "",
  credit_unit: "",
};

export default function AdminCourseDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<CourseInfoDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { layout } = useLayout();
  const [sidePanelLoading, setSidePanelLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
  const [editingCourse, setEditingCourse] = useState<CourseInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    ...initialFormData,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CourseFormData, string>>
  >({});

  const handleClearError = (name: string) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const coursesData = await getCourses();
      setCourses(coursesData);
      setLoading(false);
      const programs = await getPrograms();
      setPrograms(programs);
      const semesters = await getSemesters();
      setSemesters(semesters);
      const yearLevels = await getYearLevels();
      setYearLevels(yearLevels);
    }
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const query = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(query) ||
        course.course_title.toLowerCase().includes(query)
    );
  }, [searchQuery, courses]);

  const openEditPanel = async (courseCode: string) => {
    try {
      const course = await getCourse(courseCode);
      if (!course) return;

      setIsEditing(true);
      setEditingCourse(course);

      setFormData({
        course_code: course.course_code,
        course_title: course.course_title,
        program: String(course.program_id),
        year_level: String(course.year_level_id),
        semester: String(course.semester_id),
        lecture_unit: String(course.lecture_unit),
        laboratory_unit: String(course.laboratory_unit),
        credit_unit: String(course.credit_unit),
      });

      setIsPanelOpen(true);
    } catch (err) {
      console.error("Failed to load course info:", err);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};

    if (!formData.course_code?.trim()) {
      newErrors.course_code = "Course code is required";
    }
    if (!formData.course_title?.trim()) {
      newErrors.course_title = "Course title is required";
    }
    if (!formData.program) {
      newErrors.program = "Program is required";
    } else if (isNaN(Number(formData.program))) {
      newErrors.program = "Program must be a valid number";
    }
    if (!formData.year_level) {
      newErrors.year_level = "Year level is required";
    } else if (isNaN(Number(formData.year_level))) {
      newErrors.year_level = "Year level must be a valid number";
    }
    if (!formData.semester) {
      newErrors.semester = "Semester is required";
    } else if (isNaN(Number(formData.semester))) {
      newErrors.semester = "Semester must be a valid number";
    }
    if (!formData.lecture_unit?.trim()) {
      newErrors.lecture_unit = "Lecture unit is required";
    } else if (isNaN(Number(formData.lecture_unit))) {
      newErrors.lecture_unit = "Lecture unit must be a number";
    }
    if (!formData.laboratory_unit?.trim()) {
      newErrors.laboratory_unit = "Laboratory unit is required";
    } else if (isNaN(Number(formData.laboratory_unit))) {
      newErrors.laboratory_unit = "Laboratory unit must be a number";
    }
    if (!formData.credit_unit?.trim()) {
      newErrors.credit_unit = "Credit unit is required";
    } else if (isNaN(Number(formData.credit_unit))) {
      newErrors.credit_unit = "Credit unit must be a number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSidePanelLoading(true);

    if (!validateForm()) {
      setSidePanelLoading(false);
      return;
    }

    const payload = formDataToPayload(formData);

    try {
      if (editingCourse) {
        const updatedCourse = await editCourse(
          editingCourse.course_code,
          payload
        );
        setCourses((prev) =>
          prev.map((c) =>
            c.id === updatedCourse.course_code ? updatedCourse : c
          )
        );
      } else {
        const newCourse = await addCourse(payload);
        if (newCourse) setCourses((prev) => [...prev, newCourse]);
      }
    } catch (err) {
      console.error("Error submitting course:", err);
    } finally {
      setFormData(initialFormData);
      setEditingCourse(null);
      setIsPanelOpen(false);
      setSidePanelLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  const handleDelete = async (id: string) => {
    const success = await deleteCourse(id);
    if (success) setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppLayout activeItem="/admin/course_management">
      <ToolBarComponent
        titleOptions={[
          {
            label: "All Courses",
            value: "",
            enableSearch: true,
            enableLayout: true,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        buttonLabel="Add Course"
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        onButtonClick={() => setIsPanelOpen(true)}
      />
      {layout === "cards" ? (
        <CardsGridComponent
          onEdit={(id) => openEditPanel(String(id))}
          onDelete={(id) => handleDelete(String(id))}
          items={filteredCourses}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          aspectRatio="20/9"
          fieldTop={(course) => course.course_code}
          title={(course) => course.course_title}
          subtitle={(course) => {
            const semesterText = course.semester_type
              .toLowerCase()
              .replace("semester", "sem")
              .trim();
            return `${course.year_level_type} ${semesterText} | ${course.program_name}`;
          }}
          loading={loading}
          disableCardPointer
          enableOption
        />
      ) : (
        <TableComponent
          data={filteredCourses}
          emptyImageSrc={emptyImage}
          emptyMessage="No Courses Available!"
          columns={[
            { key: "course_code", label: "Code" },
            { key: "course_title", label: "Course Title" },
            { key: "program_name", label: "Program" },
            { key: "semester_type", label: "Semester" },
            { key: "year_level_type", label: "Year Level" },
          ]}
          onEdit={(id) => openEditPanel(id)}
          onDelete={(id) => handleDelete(String(id))}
          disableRowPointer
          loading={loading}
          skeletonRows={5}
          showActions
        />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingCourse(null);
          setIsEditing(false);
          setSidePanelLoading(false);
          setFormData(initialFormData);
        }}
        panelFunction={editingCourse ? "Edit Course" : "Add Course"}
        onSubmit={handleSubmit}
        buttonFunction={editingCourse ? "Update Course" : "Add Course"}
        loading={sidePanelLoading}
      >
        <UserInputComponent
          label="Course Code"
          name="course_code"
          required
          error={errors.course_code}
          value={formData.course_code}
          onChange={handleInputChange}
          onClearError={handleClearError}
          readOnly={isEditing}
          loading={sidePanelLoading}
        />
        <UserInputComponent
          label="Lecture Unit"
          name="lecture_unit"
          required
          error={errors.lecture_unit}
          value={formData.lecture_unit}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <UserInputComponent
          label="Course Title"
          name="course_title"
          required
          error={errors.course_title}
          value={formData.course_title}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <UserInputComponent
          label="Laboratory Unit"
          name="laboratory_unit"
          required
          error={errors.laboratory_unit}
          value={formData.laboratory_unit}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <DropdownComponent
          label="Program"
          name="program"
          required
          error={errors.program}
          options={programs.map((d) => ({
            value: String(d.program_id),
            label: d.program_name,
          }))}
          value={formData.program}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <UserInputComponent
          label="Credit Unit"
          name="credit_unit"
          required
          error={errors.credit_unit}
          value={formData.credit_unit}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <DropdownComponent
          label="Year Level"
          name="year_level"
          required
          error={errors.year_level}
          options={yearLevels.map((d) => ({
            value: String(d.year_level_id),
            label: d.year_level_type,
          }))}
          value={formData.year_level}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <div>{}</div>
        <DropdownComponent
          label="Semester"
          name="semester"
          required
          error={errors.semester}
          options={semesters.map((d) => ({
            value: String(d.semester_id),
            label: d.semester_type,
          }))}
          value={formData.semester}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}

function formDataToPayload(formData: CourseFormData): CoursePayload {
  return {
    course_code: formData.course_code,
    course_title: formData.course_title,
    program: Number(formData.program),
    year_level: Number(formData.year_level),
    semester: Number(formData.semester),
    lecture_unit: Number(formData.lecture_unit),
    laboratory_unit: Number(formData.laboratory_unit),
    credit_unit: Number(formData.credit_unit),
  };
}
