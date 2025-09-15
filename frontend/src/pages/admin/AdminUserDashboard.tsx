import { useMemo, useState } from "react";
import { getAllUsers } from "../../utils/getAllUsers";
import type { UserInfo } from "../../utils/getAllUsers";
import ToolBarComponent from "../../components/ToolBarComponent";
import PlusIcon from "../../assets/plus-solid.svg?react";
import emptyImage from "../../assets/undraw_people.svg";
import TableComponent from "../../components/TableComponent";
import SidePanelComponent from "../../components/SidePanelComponent";
import UserInputComponent from "../../components/UserInputComponent";
import DropdownComponent from "../../components/DropDownComponent";
import AppLayout from "../../layout/AppLayout";
import dummy from "../../data/dummy";

export default function AdminUserDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const users: UserInfo[] = getAllUsers();
  const db = dummy[0];

  const departmentOptions = db.department_tbl.map((c) => c.department_name);
  
  const roleOptions = db.role_tbl
    .filter((c) => c.role !== "Administrator")
    .map((c) => c.role);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.id.toString().includes(query) ||
        user.name.toLowerCase().includes(query)
    );
  }, [searchQuery, users]);

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
        onDelete={(id) => console.log("Delete user", id)}
        showActions
      />
      <SidePanelComponent
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Add Faculty"
        submit={() => console.log("API Request POST")}
        fullWidthRow={false}
        buttonFunction="Add Faculty"
      >
        <UserInputComponent label="First Name" name="first_name" />
        <UserInputComponent label="User ID" name="user_id" />
        <UserInputComponent label="Middle Name" name="middle_name" />
        <UserInputComponent label="Email" name="email" />
        <UserInputComponent label="Last Name" name="last_name" />
        <DropdownComponent label="Role" options={roleOptions} />
        <UserInputComponent label="Suffix" name="suffix" />
        <DropdownComponent
          label="Department"
          options={departmentOptions}
        />
      </SidePanelComponent>
    </AppLayout>
  );
}
