import { useState } from "react";
import AnalyticsIcon from "../assets/chart-simple.svg?react";

type Props = {
  goToAssessmentPage: () => void;
};

const TOOLBAR_Z = "z-35";
const containerBase = `fixed bottom-4 left-1/2 -translate-x-1/2 ${TOOLBAR_Z} 
  bg-white border border-[#E9E6E6] shadow-lg rounded-full px-4 py-2 
  flex items-center space-x-4 transition-all duration-300`;

const reopenBtnBase = `fixed bottom-4 left-1/2 -translate-x-1/2 ${TOOLBAR_Z} 
  p-2 rounded-full bg-white border border-[#E9E6E6] shadow-md 
  hover:bg-gray-50 transition`;

export default function ActionBarComponent({ goToAssessmentPage }: Props) {
  const [toolbarOpen, setToolbarOpen] = useState(true);

  return (
    <>
      <div
        className={`${containerBase} ${
          toolbarOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={goToAssessmentPage}
          className="relative px-4 py-2 rounded-full flex items-center gap-2 
          bg-ucap-yellow hover:bg-ucap-yellow-hover hover:cursor-pointer transition group"
          title="Generate COA Result Sheet"
          aria-label="Generate COA Result Sheet"
        >
          <AnalyticsIcon className="w-5 h-5 text-white" />
          <span className="text-xs text-white">View Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setToolbarOpen(false)}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Hide Toolbar"
          aria-label="Hide Toolbar"
        >
          <svg
            className="w-4 h-4 text-[#767676]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {!toolbarOpen && (
        <button
          type="button"
          onClick={() => setToolbarOpen(true)}
          className={reopenBtnBase}
          title="Show Toolbar"
          aria-label="Show Toolbar"
        >
          <svg
            className="w-5 h-5 text-[#767676]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}
    </>
  );
}
