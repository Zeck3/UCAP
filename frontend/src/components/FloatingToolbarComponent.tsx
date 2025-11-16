import { useState } from "react";
import FileImportIcon from "../assets/file-import-solid.svg?react";
import AnalyticsIcon from "../assets/chart-simple.svg?react";
import { importStudentsCSV } from "../api/instructorStudentListUploadApi";

type Props = {
  goToAssessmentPage: () => void;
  sectionId: number;
  refreshStudents: () => Promise<void>;
  canGenerateResultSheet: boolean;
};

const TOOLBAR_Z = "z-[1500]";
const containerBase = `fixed bottom-4 left-1/2 -translate-x-1/2 ${TOOLBAR_Z} bg-white border border-[#E9E6E6] shadow-lg rounded-full px-4 py-2 flex items-center space-x-4 transition-all duration-300`;
const reopenBtnBase = `fixed bottom-4 left-1/2 -translate-x-1/2 ${TOOLBAR_Z} p-2 rounded-full bg-white border border-[#E9E6E6] shadow-md hover:bg-gray-50 transition`;

export default function FloatingToolbarComponent({
  goToAssessmentPage,
  sectionId,
  refreshStudents,
  canGenerateResultSheet,
}: Props) {
  const [toolbarOpen, setToolbarOpen] = useState(true);

  // modal
  const [showImportModal, setShowImportModal] = useState(false);

  // append / override mode (chosen before uploading)
  const [pendingMode, setPendingMode] = useState<"append" | "override" | null>(
    null
  );

  return (
    <>
      {/* Hidden file input (fires only AFTER picking append/override) */}
      <input
        type="file"
        accept=".csv"
        id="student-csv-input"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !pendingMode) return;

          try {
            await importStudentsCSV(sectionId, file, pendingMode);
            alert("Master List Imported Successfully.");
            await refreshStudents();
          } catch (err) {
            console.error(err);
            alert("Failed to import CSV. Check the file format.");
          }

          // cleanup
          setPendingMode(null);
          setShowImportModal(false);
          e.target.value = "";
        }}
      />

      {/* Toolbar */}
      <div
        className={`${containerBase} transition-all ${
          toolbarOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        {/* IMPORT MASTER LIST BUTTON */}
        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-gray-100 hover:cursor-pointer group"
          title="Import Master List"
          aria-label="Import Master List"
          onClick={() => setShowImportModal(true)} // <--- NOW OPENS MODAL FIRST
        >
          <FileImportIcon className="w-5 h-5 text-[#767676]" />
          <span
            className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2
              text-xs text-white bg-[#767676] px-2 py-1 rounded opacity-0
              group-hover:opacity-100 transition"
          >
            Import Master List
          </span>
        </button>

        {/* RESULT SHEET */}
        <button
          type="button"
          onClick={goToAssessmentPage}
          disabled={!canGenerateResultSheet}
          className={`relative px-4 py-2 rounded-full bg-ucap-yellow flex items-center gap-2 transition group ${
            canGenerateResultSheet
              ? "hover:bg-ucap-yellow-hover hover:cursor-pointer"
              : "opacity-50 cursor-not-allowed"
          }`}
          title={
            canGenerateResultSheet
              ? "Generate COA Result Sheet"
              : "Set Course Outcomes and CO-PO Mapping first"
          }
          aria-label="Generate COA Result Sheet"
        >
          <AnalyticsIcon className="w-5 h-5 text-white" />
          <span className="text-xs text-white">Generate Result Sheet</span>
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

      {/* REOPEN TOOLBAR */}
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

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-[#3e3e3e30] border-[#E9E6E6] flex items-center justify-center z-2000">
          <div className="bg-white p-6 rounded-xl space-y-4 w-120">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg">Import Master List</h2>
              <p className="text-sm">How do you want to apply this CSV?</p>
            </div>

            <div className="space-y-2">
              <button
                className="w-full bg-ucap-yellow text-white py-2 rounded-lg cursor-pointer"
                onClick={() => {
                  setPendingMode("append");
                  setShowImportModal(false);
                  document.getElementById("student-csv-input")?.click();
                }}
              >
                Append to Existing Student List
              </button>

              <button
                className="w-full border border-red-400 text-red-400 hover:text-red-500 py-2 rounded-lg cursor-pointer"
                onClick={() => {
                  setPendingMode("override");
                  setShowImportModal(false);
                  document.getElementById("student-csv-input")?.click();
                }}
              >
                Override Student List
              </button>
            </div>

            <button
              className="w-full py-2 text-gray-600 rounded-lg cursor-pointer"
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
