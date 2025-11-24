import { useMemo, useState, useEffect } from "react";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  deleteUser,
} from "../../api/userManagementApi";
import {
  getRoles,
  getCampuses,
} from "../../api/dropdownApi";
import type {
  UserRole,
  Department,
  Campus,
  College,
} from "../../types/dropdownTypes";
import type {
  FacultyInfoDisplay,
  FacultyInfo,
  FacultyFormData,
  FacultyPayload,
  UserMutationResult,
} from "../../types/userManagementTypes";
import ToolBarComponent from "../../components/ToolBarComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import emptyImage from "../../assets/undraw_people.svg";
import TableComponent from "../../components/TableComponent";
import SidePanelComponent from "../../components/SidePanelComponent";
import UserInputComponent from "../../components/UserInputComponent";
import DropdownComponent from "../../components/DropDownComponent";
import AppLayout from "../../layout/AppLayout";
import { toast } from "react-toastify";
import DepartmentSearchTagPicker from "../../components/DepartmentPickerComponent";
import InfoComponent from "../../components/InfoComponent";
import { getColleges, getDepartments } from "../../api/hierarchyManagementApi";

const initialFormData = {
  user_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  email: "",
  user_role: "",
  departments: [] as string[],
  chair_department: "",
  dean_college: "",
  vcaa_campus: "",
};

export default function AdminUserDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidePanelLoading, setSidePanelLoading] = useState(false);
  const [users, setUsers] = useState<FacultyInfoDisplay[]>([]);
  const [editingFaculty, setEditingFaculty] = useState<FacultyInfo | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [errors, setErrors] = useState<{
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    user_role?: string;
    departments?: string;
    chair_department?: string;
    dean_college?: string;
    vcaa_campus?: string;
  }>({});

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function ensureDropdownsLoaded() {
    if (dropdownsLoaded) return;

    const [rolesData, deptsData, campusData, collegeData] = await Promise.all([
      getRoles(),
      getDepartments(),
      getCampuses(),
      getColleges(),
    ]);
    setRoles(rolesData);
    setDepartments(deptsData);
    setCampuses(campusData);
    setColleges(collegeData);
    setDropdownsLoaded(true);
  }

  const handleClearError = (name: string) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openEditPanel = async (id: number) => {
    try {
      setSidePanelLoading(true);
      const [faculty] = await Promise.all([
        getUser(id),
        ensureDropdownsLoaded(),
      ]);

      if (!faculty) return;

      setIsEditing(true);
      setEditingFaculty(faculty);

      setFormData({
        user_id: String(faculty.user_id),
        first_name: faculty.first_name || "",
        middle_name: faculty.middle_name || "",
        last_name: faculty.last_name || "",
        suffix: faculty.suffix || "",
        email: faculty.email,
        user_role: faculty.user_role ? String(faculty.user_role) : "",
        departments: (faculty.department_ids || []).map(String),
        chair_department: faculty.chair_department
          ? String(faculty.chair_department)
          : "",
        dean_college: faculty.dean_college ? String(faculty.dean_college) : "",
        vcaa_campus: faculty.vcaa_campus ? String(faculty.vcaa_campus) : "",
      });

      setIsPanelOpen(true);
    } catch (err) {
      console.error("Failed to load faculty info:", err);
    } finally {
      setSidePanelLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return Object.values(u).some((val) => {
        if (val == null) return false;
        if (
          typeof val === "number" ||
          typeof val === "string" ||
          typeof val === "boolean"
        ) {
          return String(val).toLowerCase().includes(q);
        }
        return false;
      });
    });
  }, [searchQuery, users]);

  const selectedRole = roles.find(
    (r) => String(r.user_role_id) === formData.user_role
  );

  const isDeptChair = selectedRole?.user_role_type === "Department Chair";

  const isDean = selectedRole?.user_role_type === "Dean";

  const isVCAA = selectedRole?.user_role_type === "Vice Chancellor for Academic Affairs";

  const requiresTeachingDepts =
    !!selectedRole && selectedRole.user_role_type !== "Administrator";

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.user_id) {
      newErrors.user_id = "User ID is required";
    } else if (!/^\d+$/.test(formData.user_id)) {
      newErrors.user_id = "User ID must be a number";
    }
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First Name is required";
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last Name is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.user_role) {
      newErrors.user_role = "User Role is required";
    }
    if (isDeptChair && !formData.chair_department) {
      newErrors.chair_department = "Chair department is required";
    }
    if (isDean && !formData.dean_college) {
      newErrors.dean_college = "College assignment is required";
    }
    if (isVCAA && !formData.vcaa_campus) {
      newErrors.vcaa_campus = "Campus assignment is required";
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

    let response: UserMutationResult;

    try {
      if (editingFaculty) {
        response = await editUser(editingFaculty.user_id, payload);
      } else {
        response = await addUser(payload);
      }

      if (response.errors) {
        const backend = response.errors;
        const newErrors: typeof errors = {};

        if (backend.user_id) newErrors.user_id = backend.user_id[0];
        if (backend.email) newErrors.email = backend.email[0];

        setErrors(newErrors);
        setSidePanelLoading(false);
        return;
      }

      if (response.data) {
        const newUser = response.data;

        if (editingFaculty) {
          setUsers((prev) =>
            prev.map((u) => (u.id === newUser.id ? newUser : u))
          );
          toast.success("User updated successfully");
        } else {
          setUsers((prev) => [...prev, newUser]);
          toast.success("User added successfully");
        }
      }

      setFormData(initialFormData);
      setEditingFaculty(null);
      setIsPanelOpen(false);
      setSidePanelLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
      setSidePanelLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteUser(id);
    if (success) setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("User deleted successfully");
  };

  return (
    <AppLayout activeItem="/admin/user_management">
      <InfoComponent
        title={"University of Science and Technology of Southern Philippines"}
        subtitle={"UCAP - User Management"}
        details={""}
      />
      <ToolBarComponent
        titleOptions={[
          {
            label: "All Faculty",
            value: "",
            enableSearch: true,
            enableLayout: false,
            enableButton: true,
          },
        ]}
        onSearch={(val) => setSearchQuery(val)}
        buttonLabel="Add Faculty"
        buttonIcon={<PlusIcon className="text-white h-5 w-5" />}
        onButtonClick={async () => {
          setIsEditing(false);
          setEditingFaculty(null);
          setFormData(initialFormData);
          setIsPanelOpen(true);

          setSidePanelLoading(true);
          await ensureDropdownsLoaded();
          setSidePanelLoading(false);
        }}
      />
      <TableComponent
        data={filteredUsers}
        emptyImageSrc={emptyImage}
        emptyMessage="No Faculty Available!"
        columns={[
          { key: "id", label: "User ID" },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "designation", label: "Designation" },
          { key: "departments", label: "Teaching Department/s" },
        ]}
        onEdit={(id) => openEditPanel(Number(id))}
        onDelete={(id) => handleDelete(Number(id))}
        loading={loading}
        skeletonRows={5}
        showActions
      />
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingFaculty(null);
          setIsEditing(false);
          setSidePanelLoading(false);
          setFormData(initialFormData);
          setErrors({});
        }}
        panelFunction={editingFaculty ? "Edit Faculty" : "Add Faculty"}
        onSubmit={handleSubmit}
        buttonFunction={editingFaculty ? "Update Faculty" : "Add Faculty"}
        loading={sidePanelLoading}
        singleColumn
      >
        <div className="flex flex-col">
          <span className="text-[#767676]">Basic Information</span>
          <br />
          <UserInputComponent
            label="First Name"
            name="first_name"
            required
            error={errors.first_name}
            value={formData.first_name}
            onChange={handleInputChange}
            onClearError={handleClearError}
            loading={sidePanelLoading}
            maxLength={255}
          />
          <UserInputComponent
            label="Middle Name"
            name="middle_name"
            value={formData.middle_name}
            onChange={handleInputChange}
            onClearError={handleClearError}
            loading={sidePanelLoading}
            maxLength={255}
          />
          <UserInputComponent
            label="Last Name"
            name="last_name"
            required
            error={errors.last_name}
            value={formData.last_name}
            onChange={handleInputChange}
            onClearError={handleClearError}
            loading={sidePanelLoading}
            maxLength={255}
          />
          <UserInputComponent
            label="Suffix"
            name="suffix"
            value={formData.suffix}
            onChange={handleInputChange}
            onClearError={handleClearError}
            loading={sidePanelLoading}
          />
          <UserInputComponent
            label="Email"
            name="email"
            required
            error={errors.email}
            value={formData.email}
            onChange={handleInputChange}
            onClearError={handleClearError}
            loading={sidePanelLoading}
            maxLength={255}
          />
          <br />
          <span className="text-[#767676]">Role and Designation</span>
          <br />
          <UserInputComponent
            label="User ID"
            name="user_id"
            required
            error={errors.user_id}
            value={formData.user_id}
            onChange={handleInputChange}
            onClearError={handleClearError}
            readOnly={isEditing}
            loading={sidePanelLoading}
            maxLength={10}
            numericOnly
          />
          <DropdownComponent
            label="User Role"
            name="user_role"
            required
            error={errors.user_role}
            options={roles.map((r) => ({
              value: String(r.user_role_id),
              label: r.user_role_type,
            }))}
            value={formData.user_role}
            onChange={handleInputChange}
            onClearError={handleClearError}
            loading={sidePanelLoading}
          />
          {isDeptChair ? (
            <DropdownComponent
              label="Department Designation"
              name="chair_department"
              required
              error={errors.chair_department}
              options={departments.map((d) => ({
                value: String(d.department_id),
                label: d.department_name,
              }))}
              value={formData.chair_department}
              onChange={handleInputChange}
              onClearError={handleClearError}
              loading={sidePanelLoading}
            />
          ) : (
            <></>
          )}
          {isDean ? (
            <DropdownComponent
              label="College Designation"
              name="dean_college"
              required
              error={errors.dean_college}
              options={colleges.map((c) => ({
                value: String(c.college_id),
                label: c.college_name,
              }))}
              value={formData.dean_college}
              onChange={handleInputChange}
              onClearError={handleClearError}
              loading={sidePanelLoading}
            />
          ) : (
            <></>
          )}
          {isVCAA ? (
            <DropdownComponent
              label="Campus Designation"
              name="vcaa_campus"
              required
              error={errors.vcaa_campus}
              options={campuses.map((cp) => ({
                value: String(cp.campus_id),
                label: cp.campus_name,
              }))}
              value={formData.vcaa_campus}
              onChange={handleInputChange}
              onClearError={handleClearError}
              loading={sidePanelLoading}
            />
          ) : (
            <></>
          )}
          {formData.user_role && requiresTeachingDepts ? (
            <DepartmentSearchTagPicker
              label="If faculty is teaching, please choose their department/s."
              value={formData.departments}
              options={departments}
              onChange={(ids) =>
                setFormData((f) => ({ ...f, departments: ids.map(String) }))
              }
              loading={sidePanelLoading}
            />
          ) : (
            <></>
          )}
        </div>
      </SidePanelComponent>
    </AppLayout>
  );
}

function formDataToPayload(formData: FacultyFormData): FacultyPayload {
  return {
    user_id: Number(formData.user_id),
    first_name: formData.first_name.trim() || null,
    middle_name: formData.middle_name.trim() || null,
    last_name: formData.last_name.trim(),
    suffix: formData.suffix.trim() || null,
    email: formData.email.trim(),
    user_role: formData.user_role ? Number(formData.user_role) : null,
    departments: formData.departments.map(Number),
    chair_department: formData.chair_department
      ? Number(formData.chair_department)
      : null,
    dean_college: formData.dean_college ? Number(formData.dean_college) : null,
    vcaa_campus: formData.vcaa_campus ? Number(formData.vcaa_campus) : null,
  };
}
