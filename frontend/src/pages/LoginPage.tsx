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

  interface LoginResponse {
    token: string;
    [key: string]: any;
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response: Response = await fetch(
        "http://localhost:8000/api/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid user_id or password");
      }

      const data: LoginResponse = await response.json();
      console.log("Login success:", data);

      localStorage.setItem("token", data.token);
      setSuccess("Login successful!");

      navigate("/course_dashboard");
    } catch (err: unknown) {
      setError("Invalid user_id or password");
      console.error(err);
    }
  };
  const goToCourseDashboard = () => {
    navigate("/course_dashboard");
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
            onLoginClick={() => goToCourseDashboard()}
            showError={false}
          />
          <WelcomeComponent />
        </div>
      </main>
    </div>
  );
}
