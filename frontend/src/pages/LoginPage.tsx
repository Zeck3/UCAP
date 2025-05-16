import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginComponent from "../components/LoginComponent";
import WelcomeComponent from "../components/WelcomeComponent";

export default function LoginPage() {
  const navigate = useNavigate();
  const [user_id, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    document.title = "uCAP";
  }, []);
  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/course_dashboard");
    } catch (err) {
      console.error(err);
      setError("Invalid user ID or password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex px-12 py-6.5">
        <div className="flex flex-start w-screen">
          <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-22.5" />
        </div>
      </header>
      <main className="w-screen flex flex-1">
        <div className="flex flex-col-reverse lg:flex-row flex-1">
          <LoginComponent
            user_id={user_id}
            setUserId={setUserID}
            password={password}
            setPassword={setPassword}
            onLoginClick={handleLogin}
            showError={false}
          />
          <WelcomeComponent />
        </div>
      </main>
    </div>
  );
}
