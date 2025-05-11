import { useEffect, useState } from "react";

export default function RolePage() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/roles/");
        if (!response.ok) throw new Error("Failed to fetch roles");
        const data = await response.json();
        setRoles(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div>
      <h2>Available Roles</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {roles.map((role: any) => (
          <li key={role.role_id}>{role.role_type}</li>
        ))}
      </ul>
    </div>
  );
}
