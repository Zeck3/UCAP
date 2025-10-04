import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginComponent from "../components/LoginComponent";
import WelcomeComponent from "../components/WelcomeComponent";
import { useAuth } from "../context/useAuth";
import { roleRoutes } from "../config/Roles";

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, user } = useAuth();

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (user) {
      const route = roleRoutes[user.role_id];
      if (route) {
        navigate(route, { replace: true });
      } else {
        console.warn(`No route defined for role_id: ${user.role_id}`);
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() && !password.trim()) {
      setErrorMessage("Please enter User ID and Password.");
      return;
    } else if (!userId.trim()) {
      setErrorMessage("Please enter your User ID.");
      return;
    } else if (!password.trim()) {
      setErrorMessage("Please enter your Password.");
      return;
    }

    setLoading(true);

    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      setErrorMessage("Invalid Login Credentials");
      setLoading(false);
      setUserId("");
      setPassword("");
      return;
    }

    try {
      await login(parsedUserId, password);
      setLoading(false);
      setUserId("");
      setPassword("");
    } catch {
      setErrorMessage("Invalid Login Credentials");
      setLoading(false);
      setUserId("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="w-screen flex flex-1">
        <div className="flex flex-col-reverse lg:flex-row flex-1">
          <LoginComponent
            user_id={userId}
            setUserId={setUserId}
            password={password}
            setPassword={setPassword}
            onLoginClick={handleSubmit}
            errorMessage={errorMessage}
            loading={loading}
          />
          <WelcomeComponent />
        </div>
      </main>
    </div>
  );
}
