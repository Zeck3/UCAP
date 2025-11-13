import { useState } from "react";
import FileImportIcon from "../assets/file-import-solid.svg?react";
import AnalyticsIcon from "../assets/chart-simple.svg?react";

export default function FloatingToolbar({
  goToAssessmentPage,
}: {
  goToAssessmentPage: () => void;
}) {
  const [toolbarOpen, setToolbarOpen] = useState(true);

  return (
    <>
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white border border-[#E9E6E6] shadow-lg rounded-full px-4 py-2 flex items-center space-x-4 transition-all duration-300 ${
          toolbarOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <button
          className="relative px-2 py-2 p-2 rounded-full hover:bg-gray-100 group"
          title="Import Master List"
        >
          <FileImportIcon className="w-5 h-5 text-[#767676]" />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-xs text-white bg-[#767676] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Import Master List
          </span>
        </button>

        {/* <button
          className="relative px-2 py-2 p-2 rounded-full hover:bg-gray-100 group"
          title="Export Class Record"
        >
          <FileExportIcon className="w-5 h-5 text-[#767676]" />
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-xs text-white bg-[#767676] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            Export Class Record
          </span>
        </button> */}

        <button
          onClick={goToAssessmentPage}
          className="relative px-4 py-2 p-2 rounded-full flex items-center gap-2 bg-ucap-yellow hover:bg-ucap-yellow-hover transition group"
          title="Generate COA Result Sheet"
        >
          <AnalyticsIcon className="w-5 h-5 text-white" />
          <span className="text-xs text-white">
            Generate Result Sheet
          </span>
        </button>

        <button
          onClick={() => setToolbarOpen(false)}
          className="px-2 py-2 p-2 rounded-full hover:bg-gray-100"
          title="Hide Toolbar"
        >
          <svg
            className="w-4 h-4 text-[#767676]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
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
          onClick={() => setToolbarOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 p-2 rounded-full bg-white border border-[#E9E6E6] shadow-md hover:bg-gray-50 transition"
          title="Show Toolbar"
        >
          <svg
            className="w-5 h-5 text-[#767676]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
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
