import { useMemo, useState, useEffect } from "react";
import {
  getUsers,
  getUser,
  addUser,
  editUser,
  deleteUser,
} from "../../api/userManagementApi";
import { getRoles, getDepartments } from "../../api/dropdownApi";
import type { UserRole, Department } from "../../types/dropdownTypes";
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

const initialFormData = {
  user_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  email: "",
  user_role: "",
  department: "",
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
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);
  const [errors, setErrors] = useState<{
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    user_role?: string;
    department?: string;
  }>({});

  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    user_role: "",
    department: "",
  });

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
    const [rolesData, deptsData] = await Promise.all([
      getRoles(),
      getDepartments(),
    ]);
    setRoles(rolesData);
    setDepartments(deptsData);
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
        user_role: faculty.user_role_id ? String(faculty.user_role_id) : "",
        department: faculty.department_id ? String(faculty.department_id) : "",
      });

      setIsPanelOpen(true);
    } catch (err) {
      console.error("Failed to load faculty info:", err);
    } finally {
      setSidePanelLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) => u.id.toString().includes(q) || u.name.toLowerCase().includes(q)
    );
  }, [searchQuery, users]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.user_id) {
      newErrors.user_id = "User ID is required";
    } else if (!/^\d+$/.test(formData.user_id)) {
      newErrors.user_id = "User ID must be a number";
    }
    if (!formData.first_name?.trim()) {
      newErrors.last_name = "First Name is required";
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
    if (!formData.department) {
      newErrors.department = "Department is required";
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
    toast.success("User Deleted!");
  };

  return (
    <AppLayout activeItem="/admin/user_management">
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
          { key: "department", label: "Department" },
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
      >
        <UserInputComponent
          label="First Name"
          name="first_name"
          required
          error={errors.first_name}
          value={formData.first_name}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
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
        />
        <UserInputComponent
          label="Middle Name"
          name="middle_name"
          value={formData.middle_name}
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
        <UserInputComponent
          label="Suffix"
          name="suffix"
          value={formData.suffix}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
        <DropdownComponent
          label="Department"
          name="department"
          required
          error={errors.department}
          options={departments.map((d) => ({
            value: String(d.department_id),
            label: d.department_name,
          }))}
          value={formData.department}
          onChange={handleInputChange}
          onClearError={handleClearError}
          loading={sidePanelLoading}
        />
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
    department: formData.department ? Number(formData.department) : null,
  };
}
