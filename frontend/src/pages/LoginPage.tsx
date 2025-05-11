import React, { useState } from "react";

export default function LoginPage() {
  const [user_id, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  interface LoginResponse {
    token: string;
    [key: string]: any; // Adjust this based on the actual response structure
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");  // Reset error message
    setSuccess(""); // Reset success message

    try {
      const response: Response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid user_id or password");
      }

      const data: LoginResponse = await response.json();
      console.log("Login success:", data);

      // Assuming the backend sends a JWT token
      // You can store the token in localStorage, sessionStorage, or a global state
      localStorage.setItem("token", data.token);  // Store the token for future use (if using JWT)

      setSuccess("Login successful!");
      // Redirect or perform further actions as necessary
    } catch (err: unknown) {
      setError("Invalid user_id or password");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>User ID: </label>
          <input
            type="text"
            name="user_id"
            value={user_id}
            onChange={(e) => setUserID(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
