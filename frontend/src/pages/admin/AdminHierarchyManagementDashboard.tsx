// src/pages/admin/AdminHierarchyManagementDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import InfoComponent from "../../components/InfoComponent";
import TableComponent from "../../components/TableComponent";
import ToolBarComponent from "../../components/ToolBarComponent";
import AppLayout from "../../layout/AppLayout";
import emptyImage from "../../assets/undraw_file-search.svg";
import SidePanelComponent from "../../components/SidePanelComponent";
import UserInputComponent from "../../components/UserInputComponent";
import DropdownComponent from "../../components/DropDownComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import { toast } from "react-toastify";

import { getCampuses } from "../../api/dropdownApi";
import {
  getColleges,
  addCollege,
  editCollege,
  deleteCollege,
  getDepartments,
  addDepartment,
  editDepartment,
  deleteDepartment,
  getPrograms,
  addProgram,
  editProgram,
  deleteProgram,
} from "../../api/hierarchyManagementApi";

import type {
  Campus,
  College,
  Department,
  Program,
} from "../../types/dropdownTypes";
import { useDocumentTitle } from "../../context/useDocumentTitle";

type Menu = "Campus" | "College" | "Department" | "Program";

type RowBase = { id: string | number };

type CampusRow = RowBase & {
  campus_id: number;
  campus_name: string;
};

type CollegeRow = RowBase & {
  college_id: number;
  college_name: string;
};

type DepartmentRow = RowBase & {
  department_id: number;
  department_name: string;
  college_id?: number | null;
  college_name?: string | null;
};

type ProgramRow = RowBase & {
  program_id: number;
  program_name: string;
  department_id?: number | null;
  department_name?: string | null;
};

type TableColumn<T extends RowBase> = { key: keyof T; label: string };

export default function AdminHierarchyManagementDashboard() {
  useDocumentTitle("UCAP - Admin Hierarchy Management");
  
  const [activeMenu, setActiveMenu] = useState<Menu>("Campus");
  const [searchQuery, setSearchQuery] = useState("");

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [listLoading, setListLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    college_id: string;
    department_id: string;
  }>({
    name: "",
    college_id: "",
    department_id: "",
  });

  const [errors, setErrors] = useState<{
    name?: string;
    college_id?: string;
    department_id?: string;
  }>({});

  async function fetchActive(menu: Menu) {
    setListLoading(true);
    try {
      if (menu === "Campus") {
        const data = await getCampuses();
        setCampuses(data);
      } else if (menu === "College") {
        const data = await getColleges();
        setColleges(data);
      } else if (menu === "Department") {
        const data = await getDepartments();
        setDepartments(data);
      } else {
        const data = await getPrograms();
        setPrograms(data);
      }
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    fetchActive(activeMenu);
    if (!campuses.length) getCampuses().then(setCampuses);
    if (!colleges.length) getColleges().then(setColleges);
    if (!departments.length) getDepartments().then(setDepartments);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu]);

  const campusRows: CampusRow[] = useMemo(
    () =>
      campuses.map((c) => ({
        ...c,
        id: c.campus_id,
      })),
    [campuses]
  );

  const collegeRows: CollegeRow[] = useMemo(
    () =>
      colleges.map((c) => ({
        ...c,
        id: c.college_id,
      })),
    [colleges]
  );

  const departmentRows: DepartmentRow[] = useMemo(
    () =>
      departments.map((d) => ({
        ...d,
        id: d.department_id,
      })),
    [departments]
  );

  const programRows: ProgramRow[] = useMemo(
    () =>
      programs.map((p) => ({
        ...p,
        id: p.program_id,
      })),
    [programs]
  );

  const campusColumns: TableColumn<CampusRow>[] = [
    { key: "campus_name", label: "Campus" },
  ];

  const collegeColumns: TableColumn<CollegeRow>[] = [
    { key: "college_name", label: "College" },
  ];

  const departmentColumns: TableColumn<DepartmentRow>[] = [
    { key: "department_name", label: "Department" },
    { key: "college_name", label: "College" },
  ];

  const programColumns: TableColumn<ProgramRow>[] = [
    { key: "program_name", label: "Program" },
    { key: "department_name", label: "Department" },
  ];

  type ColumnDef<T> = { key: keyof T; label: string };

  function filterRowsByColumns<T extends Record<string, unknown>>(
    rows: T[],
    columns: ColumnDef<T>[],
    searchQuery: string
  ) {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];

        if (value === null || value === undefined) return false;

        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return String(value).toLowerCase().includes(q);
        }

        try {
          return JSON.stringify(value).toLowerCase().includes(q);
        } catch {
          return false;
        }
      })
    );
  }

  function openAddPanel() {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", college_id: "", department_id: "" });
    setErrors({});
    setIsPanelOpen(true);
  }

  type EditableItem = College | Department | Program;

  function openEditPanel(item: EditableItem) {
    setIsEditing(true);
    setErrors({});

    if (activeMenu === "College" && "college_id" in item) {
      setEditingId(item.college_id);
      setFormData({
        name: item.college_name ?? "",
        college_id: "",
        department_id: "",
      });
    } else if (activeMenu === "Department" && "department_id" in item) {
      const dept = item as Department;

      const collegeId =
        "college_id" in dept
          ? String(dept.college_id ?? "")
          : "College" in dept
          ? String(dept.College ?? "")
          : "";

      setEditingId(dept.department_id);

      setFormData({
        name: dept.department_name ?? "",
        college_id: collegeId,
        department_id: "",
      });
    } else if (activeMenu === "Program" && "program_id" in item) {
      const prog = item as Program;

      const departmentId =
        prog.department_id != null ? String(prog.department_id) : "";

      setEditingId(prog.program_id);

      setFormData({
        name: prog.program_name ?? "",
        department_id: departmentId,
        college_id: "",
      });
    }
    setIsPanelOpen(true);
  }

  function validateForm() {
    const next: typeof errors = {};
    if (!formData.name.trim()) next.name = "Name is required";

    if (activeMenu === "Program" && !formData.department_id) {
      next.department_id = "Department is required";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (activeMenu === "College") {
        const campusId = campuses[0]?.campus_id;
        const payload = {
          college_name: formData.name.trim(),
          campus: campusId,
        };

        const saved =
          isEditing && editingId != null
            ? await editCollege(editingId, payload)
            : await addCollege(payload);

        setColleges((prev) => {
          const next = isEditing
            ? prev.map((c) => (c.college_id === saved.college_id ? saved : c))
            : [saved, ...prev];

          return next.sort((a, b) =>
            a.college_name.localeCompare(b.college_name)
          );
        });

        toast.success(
          isEditing
            ? "College updated successfully"
            : "College added successfully"
        );
      }

      if (activeMenu === "Department") {
        const campusId = campuses[0]?.campus_id;
        const payload = {
          department_name: formData.name.trim(),
          campus: campusId,
          college: formData.college_id ? Number(formData.college_id) : null,
        };

        const saved =
          isEditing && editingId != null
            ? await editDepartment(editingId, payload)
            : await addDepartment(payload);

        setDepartments((prev) => {
          const next = isEditing
            ? prev.map((d) =>
                d.department_id === saved.department_id ? saved : d
              )
            : [saved, ...prev];

          return next.sort((a, b) =>
            a.department_name.localeCompare(b.department_name)
          );
        });

        toast.success(
          isEditing
            ? "Department updated successfully"
            : "Department added successfully"
        );
      }

      if (activeMenu === "Program") {
        const payload = {
          program_name: formData.name.trim(),
          department: Number(formData.department_id),
        };

        const saved =
          isEditing && editingId != null
            ? await editProgram(editingId, payload)
            : await addProgram(payload);

        setPrograms((prev) => {
          const next = isEditing
            ? prev.map((p) => (p.program_id === saved.program_id ? saved : p))
            : [saved, ...prev];

          return next.sort((a, b) =>
            a.program_name.localeCompare(b.program_name)
          );
        });

        toast.success(
          isEditing
            ? "Program updated successfully"
            : "Program added successfully"
        );
      }

      setIsPanelOpen(false);
      setFormData({ name: "", college_id: "", department_id: "" });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setSaving(true);
    try {
      if (activeMenu === "College") {
        await deleteCollege(id);
        setColleges((prev) => prev.filter((c) => c.college_id !== id));
        toast.success("College deleted successfully");
      } else if (activeMenu === "Department") {
        await deleteDepartment(id);
        setDepartments((prev) => prev.filter((d) => d.department_id !== id));
        toast.success("Department deleted successfully");
      } else if (activeMenu === "Program") {
        await deleteProgram(id);
        setPrograms((prev) => prev.filter((p) => p.program_id !== id));
        toast.success("Program deleted successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  const showCrud = activeMenu !== "Campus";

  return (
    <AppLayout activeItem={`/admin/hierarchy_management`}>
      <InfoComponent
        title="University of Science and Technology of Southern Philippines"
        subtitle="UCAP - University Hierarchy Management"
        details=""
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "Campus",
            value: "Campus",
            enableSearch: true,
            enableLayout: false,
            enableButton: false,
          },
          {
            label: "College",
            value: "College",
            enableSearch: true,
            enableLayout: false,
            enableButton: true,
          },
          {
            label: "Department",
            value: "Department",
            enableSearch: true,
            enableLayout: false,
            enableButton: true,
          },
          {
            label: "Program",
            value: "Program",
            enableSearch: true,
            enableLayout: false,
            enableButton: true,
          },
        ]}
        onSearch={(v) => setSearchQuery(v)}
        onTitleSelect={(v) => setActiveMenu(v as Menu)}
        buttonLabel={
          activeMenu === "College"
            ? "Add College"
            : activeMenu === "Department"
            ? "Add Department"
            : activeMenu === "Program"
            ? "Add Program"
            : ""
        }
        onButtonClick={openAddPanel}
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
      />

      {activeMenu === "Campus" && (
        <TableComponent
          data={filterRowsByColumns(campusRows, campusColumns, searchQuery)}
          emptyImageSrc={emptyImage}
          emptyMessage="No campuses available"
          columns={campusColumns}
          loading={listLoading}
          showActions={false}
        />
      )}

      {activeMenu === "College" && (
        <TableComponent
          data={filterRowsByColumns(collegeRows, collegeColumns, searchQuery)}
          emptyImageSrc={emptyImage}
          emptyMessage="No colleges available"
          columns={collegeColumns}
          loading={listLoading}
          showActions
          onEdit={(id) => {
            const item = colleges.find((c) => c.college_id === Number(id));
            if (item) openEditPanel(item);
          }}
          onDelete={(id) => handleDelete(Number(id))}
        />
      )}

      {activeMenu === "Department" && (
        <TableComponent
          data={filterRowsByColumns(
            departmentRows,
            departmentColumns,
            searchQuery
          )}
          emptyImageSrc={emptyImage}
          emptyMessage="No departments available"
          columns={departmentColumns}
          loading={listLoading}
          showActions
          onEdit={(id) => {
            const item = departments.find(
              (d) => d.department_id === Number(id)
            );
            if (item) openEditPanel(item);
          }}
          onDelete={(id) => handleDelete(Number(id))}
        />
      )}

      {activeMenu === "Program" && (
        <TableComponent
          data={filterRowsByColumns(programRows, programColumns, searchQuery)}
          emptyImageSrc={emptyImage}
          emptyMessage="No programs available"
          columns={programColumns}
          loading={listLoading}
          showActions
          onEdit={(id) => {
            const item = programs.find((p) => p.program_id === Number(id));
            if (item) openEditPanel(item);
          }}
          onDelete={(id) => handleDelete(Number(id))}
        />
      )}

      {showCrud && (
        <SidePanelComponent
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          panelFunction={isEditing ? `Edit ${activeMenu}` : `Add ${activeMenu}`}
          onSubmit={handleSubmit}
          buttonFunction={isEditing ? "Update" : "Add"}
          loading={saving}
          singleColumn
        >
          <div className="flex flex-col">
            <UserInputComponent
              label={`${activeMenu[0].toUpperCase()}${activeMenu.slice(
                1
              )} Name`}
              name="name"
              required
              error={errors.name}
              value={formData.name}
              onChange={(_, v) => setFormData((f) => ({ ...f, name: v }))}
              onClearError={(n) => setErrors((e) => ({ ...e, [n]: "" }))}
              loading={saving}
              maxLength={255}
            />

            {activeMenu === "Department" ? (
              <DropdownComponent
                label="College"
                name="college_id"
                options={colleges.map((c) => ({
                  value: String(c.college_id),
                  label: c.college_name,
                }))}
                value={formData.college_id}
                onChange={(_, v) =>
                  setFormData((f) => ({ ...f, college_id: v }))
                }
                error={errors.college_id}
                onClearError={(n) => setErrors((e) => ({ ...e, [n]: "" }))}
                loading={saving}
              />
            ) : (
              <></>
            )}

            {activeMenu === "Program" ? (
              <DropdownComponent
                label="Department"
                name="department_id"
                required
                options={departments.map((d) => ({
                  value: String(d.department_id),
                  label: d.department_name,
                }))}
                value={formData.department_id}
                onChange={(_, v) =>
                  setFormData((f) => ({ ...f, department_id: v }))
                }
                error={errors.department_id}
                onClearError={(n) => setErrors((e) => ({ ...e, [n]: "" }))}
                loading={saving}
              />
            ) : (
              <></>
            )}
          </div>
        </SidePanelComponent>
      )}
    </AppLayout>
  );
}
