import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LoginPage = () => {
  const [user_id, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "uCAP";
  }, []);

interface LoginResponse {
    token: string;
    [key: string]: any;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

      localStorage.setItem("token", data.token);
      setSuccess("Login successful!");

      navigate("/course_dashboard");
    } catch (err: unknown) {
      setError("Invalid user_id or password");
      console.error(err);
    }
  };

  return (
    <div className="font-inter bg-white text-gray-700 min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-6">
        <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-20 w-auto ml-12 mt-2" />
      </header>

      {/* Body */}
      <main className="flex flex-col md:flex-row flex-1 px-4 md:px-2 pt-2 pb-35">
        {/* Login Form */}
        <section className="w-full md:w-1/2 flex items-center justify-end pr-25">
          <div className="w-full max-w-md p-8 border border-gray-200 rounded-2xl shadow">
            <h2 className="text-2xl font-medium mb-6 text-center text-gray-800">
              Log In to uCAP
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4">
                <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  name="user_id"
                  id="user-id"
                  type="text"
                  autoComplete="username"
                  value={user_id}
                  onChange={(e) => setUserID(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus-ring-ucap-blue"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  name="password"
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus-ring-ucap-blue"
                />
              </div>

              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              {success && <div className="text-green-500 text-sm text-center">{success}</div>}

              <button
                type="submit"
                className="w-full py-2 bg-ucap-yellow bg-ucap-yellow-hover text-white font-semibold rounded-md transition"
              >
                Log In
              </button>
            </form>
          </div>
        </section>

        {/* Welcome */}
        <section className="w-full md:w-1/2 flex flex-col items-start justify-center mt-10 md:mt-0 md:pl-2">
          <img
            src="/login-welcome.svg"
            alt="Login Welcome"
            className="mb-6 w-[450px] max-w-full"
          />
          <p className="text-xl font-light leading-relaxed">
            Welcome to the <br />
            <span className="text-ucap-yellow font-bold text-3xl">University </span>
            <span className="text-ucap-blue font-bold text-3xl">Course Assessment Portal</span>
          </p>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;