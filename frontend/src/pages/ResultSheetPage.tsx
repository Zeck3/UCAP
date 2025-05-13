import React, { useState, useEffect } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    user_id: "",
    role_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    password: "",
  });

  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch roles from API
    fetch("http://localhost:8000/api/roles/")
      .then((res) => res.json())
      .then((data) => setRoles(data))
      .catch((err) => setError("Failed to fetch roles"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Registration successful!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <input name="user_id" placeholder="User ID" onChange={handleChange} required />
        
        {/* Dropdown for roles */}
        <select name="role_id" onChange={handleChange} required>
          <option value="">Select Role</option>
          {roles.map((role: any) => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_type}
            </option>
          ))}
        </select>

        <input name="first_name" placeholder="First Name" onChange={handleChange} required />
        <input name="middle_name" placeholder="Middle Name" onChange={handleChange} />
        <input name="last_name" placeholder="Last Name" onChange={handleChange} required />
        <input name="suffix" placeholder="Suffix" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
