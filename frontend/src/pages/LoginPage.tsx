import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const LoginPage = () => {
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "uCAP";
  }, []);

  const goToCourseDashboard = () => {
    navigate("/course_dashboard");
  };

  return (
    <div className="text-[#3E3E3E] min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex px-16 py-6.5">
        <div className="flex flex-start w-screen">
          <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-22.5" />
        </div>
      </header>

      {/* Body */}
      <main className="w-screen flex flex-1">
        <div className="flex flex-col-reverse lg:flex-row flex-1">
          {/* Login */}
          <div className="flex lg:w-1/2 justify-center lg:justify-end items-center flex-1 lg:mr-8">
            <div className="flex flex-col w-full max-w-md px-10 py-9 gap-6 border border-[#E9E6E6] rounded-2xl">
              <h2 className="text-2xl font-medium text-center">
                Log In to uCAP
              </h2>

              <div>
                <label htmlFor="user-id" className="block text-sm font-medium">
                  User ID
                </label>
                <input
                  id="user-id"
                  type="text"
                  autoComplete="username"
                  className="w-full px-4 py-2 border border-[#E9E6E6] rounded-md focus-ring-ucap-blue"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="w-full px-4 py-2 border border-[#E9E6E6] rounded-md focus-ring-ucap-blue"
                />
                <div className="h-5 text-red-500 text-sm text-center mt-1">
                  {showError && <p>Invalid User ID or Password</p>}
                </div>
              </div>

              <button
                onClick={goToCourseDashboard}
                className="w-full py-2 bg-ucap-yellow bg-ucap-yellow-hover text-white rounded-md text-sm transition cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>

          {/* Welcome */}
          <div className="hidden lg:flex lg:w-1/2 flex-col-reverse items-center justify-start lg:items-start lg:justify-center ml-8">
            <div className="flex flex-col">
              <img
                src="/login-welcome.svg"
                alt="Login Welcome"
                className="mb-6 w-[300px] max-w-full lg:w-[500px]"
              />
              <p className="text-xl font-light leading-relaxed">
                Welcome to the <br />
                <span className="font-tilt-warp text-ucap-yellow text-2xl lg:text-3xl">
                  University{" "}
                </span>
                <span className="font-tilt-warp text-ucap-blue text-2xl lg:text-3xl">
                  Course Assessment Portal
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
