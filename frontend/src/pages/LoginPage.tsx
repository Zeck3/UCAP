import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import LoginComponent from "../components/LoginComponent";
import WelcomeComponent from "../components/WelcomeComponent";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "uCAP";
  }, []);

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
          <LoginComponent onLoginClick={() => goToCourseDashboard()} showError={false} />
          <WelcomeComponent />
        </div>
      </main>
    </div>
  );
};
