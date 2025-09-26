import { useMemo, useState, useEffect } from "react";
import { getAllUsers, deleteUser, registerUser, getRoles, getDepartments } from "../../utils/getAllUsers";
import type { UserInfo } from "../../utils/getAllUsers";
import ToolBarComponent from "../../components/ToolBarComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import emptyImage from "../../assets/undraw_people.svg";
import TableComponent from "../../components/TableComponent";
import SidePanelComponent from "../../components/SidePanelComponent";
import UserInputComponent from "../../components/UserInputComponent";
import DropdownComponent from "../../components/DropDownComponent";
import AppLayout from "../../layout/AppLayout";

export default function AdminUserDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});


  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
      const roles = await getRoles();
      setRoles(roles);
      const departments = await getDepartments();
      setDepartments(departments);
    }
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.id.toString().includes(query) ||
        user.name.toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

  const handleRegister = async () => {
    const created = await registerUser(formData);
    if (created) {
      setUsers((prev) => [...prev, created]);
      setIsPanelOpen(false);
      setFormData({});
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteUser(id);
    if (success) setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <AppLayout
      activeItem="/admin/user_management"
    >
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
        onButtonClick={() => setIsPanelOpen(true)}
      />
      {loading ? (
        <p className="text-center mt-4">Loading faculty...</p>
      ) : (
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
        onEdit={(id) => console.log("Edit user", id)}
        onDelete={handleDelete}
        showActions
      />
      )}
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Add Faculty"
        submit={handleRegister}
        fullWidthRow={false}
        buttonFunction="Add Faculty"
      >
        <UserInputComponent label="First Name" name="first_name" />
        <UserInputComponent label="User ID" name="user_id" />
        <UserInputComponent label="Middle Name" name="middle_name" />
        <UserInputComponent label="Email" name="email" />
        <UserInputComponent label="Last Name" name="last_name" />
        <DropdownComponent 
          label="Role" 
          options={roles.map((r) => r.role)}
        />
        <UserInputComponent label="Suffix" name="suffix" />
        <DropdownComponent
          label="Department"
          options={departments.map((d) => d.department_name)}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
