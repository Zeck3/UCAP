import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const LoginPage = () => {
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "uCAP";
  }, []);

  /*const handleLogin = () => {
    setShowError(true); // Simulate login error
  };*/

  const goToCourseDashboard = () => {
    navigate('/course_dashboard');
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

            <div className="mb-4">
              <label htmlFor="user-id" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                id="user-id"
                type="text"
                autoComplete="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus-ring-ucap-blue"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus-ring-ucap-blue"
              />
            </div>

            <div className="h-5 mb-6 text-red-500 text-sm text-center">
              {showError && <p>Invalid User ID or Password</p>}
            </div>

            <button
              /*onClick={handleLogin}
              className="w-full py-2 bg-ustpYellow text-white font-semibold rounded hover:bg-ustpYellow/90 transition"
              >*/
              onClick={goToCourseDashboard}
              className="w-full py-2 bg-ucap-yellow bg-ucap-yellow-hover text-white font-semibold rounded-md transition"
            >
              Log In
            </button>
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