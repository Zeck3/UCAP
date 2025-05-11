import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '/src/styles.css';

const ClassRecordPage: React.FC = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-50 text-gray-700 min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-8 shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-20 w-auto ml-12" />

          {/* Breadcrumbs */}
          <div className="flex flex-col ml-20">
            <nav className="text-sm text-gray-500 space-x-2 flex items-center">
              <img src="/dashboard-breadcrumb.svg" alt="Dashboard Icon" className="h-4 w-4 inline-block" />
              <Link to="/course_dashboard" className="hover:underline cursor-pointer">Dashboard</Link>
              <span>&gt;</span>
              <Link to="/course_dashboard/section/" className="hover:underline cursor-pointer">Course</Link>
              <span>&gt;</span>
              <Link to="/course_dashboard/section/class_record" className="hover:underline cursor-pointer">Section</Link>
            </nav>


            <div className="flex items-center space-x-2 mt-2">
              <button onClick={goBack} className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M25 12H7M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl text-gray-700 ml-8">Course | Section Class Record</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mr-10">
          <img src="/user.png" alt="User" className="w-10 h-10 rounded-full bg-gray-300 object-cover" />
          <span className="text-base font-medium text-gray-700 ml-2 mr-2">LeBron James</span>
          <img src="/down.svg" alt="Custom Icon" className="w-3 h-3" />
        </div>
      </header>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-12 bg-white shadow-inner mt-auto">
        <div className="flex items-center space-x-6 text-base text-gray-600 ml-12">
          <button className="flex items-center space-x-2 hover:underline cursor-pointer">
            <img src="/import.svg" alt="Import" className="w-4 h-4" />
            <span>Import Master List</span>
          </button>
          <button className="flex items-center space-x-2 hover:underline cursor-pointer ml-6">
            <img src="/customize.svg" alt="Customize" className="w-4 h-4" />
            <span>Customize Class Record</span>
          </button>
          <button className="flex items-center space-x-2 hover:underline cursor-pointer ml-6">
            <img src="/export.svg" alt="Export" className="w-4 h-4" />
            <span>Export Class Record</span>
          </button>
        </div>

        <button className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-full shadow transition-all duration-200 mr-10">
          <img src="/generate.svg" alt="Generate" className="w-4 h-4" />
          <span>Generate COA Result Sheet</span>
        </button>
      </footer>
    </div>
  );
};

export default ClassRecordPage;