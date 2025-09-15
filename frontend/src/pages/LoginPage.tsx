import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginComponent from "../components/LoginComponent";
import WelcomeComponent from "../components/WelcomeComponent";
import dummy from "../data/dummy";
import { useAuth } from "../context/useAuth";
import { roleRoutes } from "../config/Roles";

export default function LoginPage() {
  const navigate = useNavigate();
  const [user_id, setUserID] = useState("");
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user_id.trim() && !password.trim()) {
      setErrorMessage("Please enter User ID and Password.");
      return;
    } else if (!user_id.trim()) {
      setErrorMessage("Please enter your User ID.");
      return;
    } else if (!password.trim()) {
      setErrorMessage("Please enter your Password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const enteredId = user_id;
      const enteredPassword = password;

      setUserID("");
      setPassword("");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const users = dummy[0].user_tbl;
      const foundUser = users.find(
        (u) =>
          String(u.user_id) === enteredId &&
          String(u.password) === enteredPassword
      );

      if (foundUser) {
        login(foundUser);
        const route = roleRoutes[foundUser.role_id] ?? "/login";
        navigate(route);
      } else {
        setErrorMessage("Invalid User ID or Password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="w-screen flex flex-1">
        <div className="flex flex-col-reverse lg:flex-row flex-1">
          <LoginComponent
            user_id={user_id}
            setUserId={setUserID}
            password={password}
            setPassword={setPassword}
            onLoginClick={handleLogin}
            errorMessage={errorMessage}
            loading={loading}
          />
          <WelcomeComponent />
        </div>
      </main>
    </div>
  );
}
