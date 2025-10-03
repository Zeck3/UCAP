import { useState} from "react";
import { useNavigate } from "react-router-dom";
import type { JSX } from "react";
import ClassRecordComponent from "../components/ClassRecordComponent";
import { headerConfig } from "../data/TableHeaderConfig";

// Define main page component
export default function ClassRecordPage(): JSX.Element {
  // Initialize navigation and state for footer visibility
  const navigate = useNavigate();
  const [footerOpen, setFooterOpen] = useState(true);

  // Render page structure with header, main content, and footer
  return (
    <div className="text-gray-700 min-h-screen flex flex-col">
      // Render fixed header with back button and title
      <header className="fixed top-0 left-0 right-0 z-20 bg-white h-20 flex items-center px-6 border-b border-gray-300">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold ml-4">Class Record</h1>
      </header>

      // Render main content with table for class record
      <main className="flex-1 mt-19.5 mb-32">
        <table className="table-auto border border-gray-300 min-w-max text-center">
          <ClassRecordComponent headerConfig={headerConfig} />
        </table>
      </main>

      // Render toggleable footer with action buttons
      <footer
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-300 transition-transform duration-300 ${
          footerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="absolute -top-10 right-10 w-12 h-10 rounded-tl-full rounded-tr-full bg-white flex items-center justify-center cursor-pointer border-t border-l border-r border-gray-300"
          onClick={() => setFooterOpen((o) => !o)}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
              footerOpen ? "" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6 text-base text-gray-600">
              <button className="flex items-center space-x-2 hover:underline cursor-pointer">
                <img src="/import.svg" alt="Import" className="w-4 h-4" />
                <span>Import Master List</span>
              </button>
              <button className="flex items-center space-x-2 hover:underline cursor-pointer">
                <img src="/customize.svg" alt="Customize" className="w-4 h-4" />
                <span>Customize Class Record</span>
              </button>
              <button className="flex items-center space-x-2 hover:underline cursor-pointer">
                <img src="/export.svg" alt="Export" className="w-4 h-4" />
                <span>Export Class Record</span>
              </button>
            </div>
            <button
              onClick={() =>
                navigate("/course_dashboard/section/course_outcome_assessment")
              }
              className="flex items-center space-x-2 bg-ucap-yellow hover:bg-ucap-yellow-hover text-white font-semibold py-2 px-4 rounded-full shadow transition-all duration-200"
            >
              <img src="/generate.svg" alt="Generate" className="w-4 h-4" />
              <span>Generate COA Result Sheet</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}