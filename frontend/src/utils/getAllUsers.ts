import axios from "axios";

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

const API_URL = "http://localhost:8000/api/admin/faculty_management/";

export async function getAllUsers(): Promise<UserInfo[]> {
  try {
    const res = await axios.get(`${API_URL}faculty/`);
    return res.data.map((user: any) => ({
      id: user.user_id,
      name: `${user.first_name} ${user.middle_name ? user.middle_name + " " : ""}${user.last_name}${user.suffix ? ", " + user.suffix : ""}`,
      email: user.email,
      role: user.user_role || "N/A",
      department: user.user_department || "N/A",
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getRoles() {
  try {
    const res = await axios.get(`${API_URL}roles/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export async function getDepartments() {
  try {
    const res = await axios.get(`${API_URL}departments/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function registerUser(user: Omit<UserInfo, "id">): Promise<UserInfo | null> {
  try {
    const res = await axios.post(`${API_URL}create_faculty/`, user);
    const data = res.data;
    return {
      id: data.user_id,
      name: `${data.first_name} ${
        data.middle_name ? data.middle_name + " " : ""
      }${data.last_name}${data.suffix ? ", " + data.suffix : ""}`,
      email: data.email,
      role: data.user_role || "N/A",
      department: data.user_department || "N/A",
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
}

// ✅ Edit faculty
export async function editUser(id: number, updates: Partial<UserInfo>): Promise<UserInfo | null> {
  try {
    const res = await axios.put(`${API_URL}${id}/update_faculty/`, updates);
    const data = res.data;
    return {
      id: data.user_id,
      name: `${data.first_name} ${
        data.middle_name ? data.middle_name + " " : ""
      }${data.last_name}${data.suffix ? ", " + data.suffix : ""}`,
      email: data.email,
      role: data.user_role || "N/A",
      department: data.user_department || "N/A",
    };
  } catch (error) {
    console.error("Error editing user:", error);
    return null;
  }
}

// ✅ Delete faculty
export async function deleteUser(id: number): Promise<boolean> {
  try {
    await axios.delete(`${API_URL}${id}/delete_faculty/`);
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}