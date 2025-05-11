import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [showError, setShowError] = useState(false);

  // Set document title on component mount
  useEffect(() => {
    document.title = "Login | uCAP"; // Set the page title
  }, []);

  const handleLogin = () => {
    setShowError(true); // Simulate login error
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="p-6 pl-8">
        <h1 className="text-6xl font-extrabold">
          <span className="text-ustpYellow">u</span>
          <span className="text-ustpBlue">CAP</span>
        </h1>
      </header>

      {/* Main Layout */}
      <main className="flex flex-col md:flex-row min-h-[calc(100vh-88px)] items-center justify-center gap-x-2 -mt-12 px-4 md:px-0">
        {/* Login Form */}
        <section className="w-full md:w-1/2 flex items-center justify-end p-4 -ml-40">
          <div className="w-full max-w-md p-8 border rounded shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">Log In to uCAP</h2>

            {/* User ID */}
            <div className="mb-4">
              <input
                id="user-id"
                type="text"
                placeholder="User ID"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ustpBlue"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ustpBlue"
              />
            </div>

            {/* Fixed-space Error Message */}
            <div className="h-5 mb-6 text-red-500 text-sm text-center">
              {showError && <p>Invalid User ID or Password</p>}
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              className="w-full py-2 bg-ustpYellow text-white font-semibold rounded hover:bg-ustpYellow/90 transition"
            >
              Log In
            </button>
          </div>
        </section>

        {/* Illustration Side */}
        <section className="w-full md:w-1/2 flex flex-col items-start justify-center p-4 pl-32">
          <img
            src="/assets/loginlogo.png"
            alt="Login Logo"
            width={450}
            height={337.5}
            className="mb-6"
          />
          <p className="text-xl font-light">
            Welcome to the <br />
            <span className="text-ustpYellow font-bold text-4xl">University</span>
            <span className="text-ustpBlue font-bold text-4xl"> Course Assessment Portal</span>
          </p>
        </section>
      </main>
    </div>
  );
}