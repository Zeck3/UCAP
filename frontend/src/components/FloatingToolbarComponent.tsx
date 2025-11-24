import { useState, useRef } from "react";
import FileImportIcon from "../assets/file-import-solid.svg?react";
import DownloadIcon from "../assets/download-solid.svg?react";
import AnalyticsIcon from "../assets/chart-simple.svg?react";
import { importStudentsCSV } from "../api/instructorStudentListUploadApi";
import { exportClassRecordToExcel } from "./classrecord/utils/ExportClassRecord";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import FileInstructionComponent from "./FileInstructionComponent";

type Props = {
  goToAssessmentPage: () => void;
  sectionId: number;
  refreshStudents: () => Promise<void>;
  getExportData: () => {
    headerNodes: any[];
    students: any[];
    studentScores: Record<number, Record<string, number>>;
    maxScores: Record<string, number>;
    computedValues: Record<number, Record<string, number>>;
  };
  canGenerateResultSheet: boolean;
  hasExistingStudents: boolean;
};

const TOOLBAR_Z = "z-[1500]";
const containerBase = `fixed bottom-4 left-1/2 -translate-x-1/2 ${TOOLBAR_Z} bg-white border border-[#E9E6E6] shadow-sm rounded-full px-4 py-2 flex items-center space-x-4 transition-all duration-300`;
const reopenBtnBase = `fixed bottom-4 left-1/2 -translate-x-1/2 ${TOOLBAR_Z} p-2 rounded-full bg-white border border-[#E9E6E6] shadow-sm hover:bg-gray-50 transition`;

export default function FloatingToolbarComponent({
  goToAssessmentPage,
  sectionId,
  refreshStudents,
  getExportData,
  canGenerateResultSheet,
  hasExistingStudents,
}: Props) {
  const [toolbarOpen, setToolbarOpen] = useState(true);

  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runImport = async (
    mode: "append" | "override",
    fileOverride?: File | null
  ) => {
    const file = fileOverride ?? selectedFile;
    if (!file) return;

    // CLOSE MODALS IMMEDIATELY WHEN PROCESSING STARTS
    setShowInstructionModal(false);
    setShowModeModal(false);
    setIsImporting(true);

    try {
      await importStudentsCSV(sectionId, file, mode);
      toast.success("Student list imported successfully");
      await refreshStudents();
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      const message =
        error.response?.data?.detail ??
        "Failed to import CSV. Please check the file format.";
      toast.error(message);
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
      resetFileInput();
    }
  };

  const handleExport = async () => {
    try {
      const data = getExportData();
      await exportClassRecordToExcel(data);
      toast.success("Class record exported successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export class record");
    }
  };

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;

    setSelectedFile(file);

    if (!hasExistingStudents) {
      setShowInstructionModal(false);
      await runImport("append", file);
    } else {
      setShowInstructionModal(false);
      setShowModeModal(true);
    }
  };

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
          className="relative p-2 rounded-full hover:bg-gray-100 hover:cursor-pointer group"
          title="Import Student List"
          aria-label="Import Student List"
          onClick={() => setShowInstructionModal(true)}
        >
          <FileImportIcon className="w-5 h-5 text-[#767676]" />
          <span
            className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2
              text-xs text-white bg-[#767676] px-2 py-1 rounded opacity-0
              group-hover:opacity-100 transition"
          >
            Import Student List
          </span>
        </button>

        <button
          type="button"
          className="relative p-2 rounded-full hover:bg-gray-100 hover:cursor-pointer group"
          title="Export Class Record"
          aria-label="Export Class Record"
          onClick={handleExport}
        >
          <DownloadIcon className="w-5 h-5 text-[#767676]" />
          <span
            className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2
              text-xs text-white bg-[#767676] px-2 py-1 rounded whitespace-nowrap opacity-0
              group-hover:opacity-100 transition"
          >
            Export Class Record
          </span>
        </button>

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
      <FileInstructionComponent
        isOpen={showInstructionModal}
        title="Import Student List (CSV)"
        description="Select a CSV file that contains student ID and Name columns to import student list."
        instructions={[
          "Only .csv files are allowed.",
          "Duplicates are automatically skipped.",
          "If this section already has students, you will choose whether to append or override after selecting a file.",
        ]}
        accept=".csv"
        primaryLabel="Choose CSV file"
        cancelLabel="Cancel"
        isProcessing={isImporting}
        onClose={() => {
          if (isImporting) return;
          setShowInstructionModal(false);
          setSelectedFile(null);
          resetFileInput();
        }}
        onFileSelected={handleFileSelected}
      />
      {showModeModal && (
        <div
          className="fixed inset-0 bg-[#3e3e3e30] flex items-center justify-center z-5000"
          onClick={() => {
            if (isImporting) return;
            setShowModeModal(false);
            setSelectedFile(null);
            resetFileInput();
          }}
        >
          <div
            className="bg-white p-6 rounded-xl space-y-4 mx-8 w-150 border border-[#E9E6E6] shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">Existing students found</h2>
              <p className="text-sm text-[#767676]">
                This section already has student records. How do you want to
                apply this CSV?
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                className="w-full bg-ucap-yellow bg-ucap-yellow-hover border border-[#ffc000] text-white py-2 rounded-lg cursor-pointer disabled:opacity-60"
                onClick={() => runImport("append")}
                disabled={isImporting}
              >
                Append to existing student list
              </button>

              <button
                type="button"
                className="w-full border border-red-400 text-red-400 hover:text-red-500 py-2 rounded-lg cursor-pointer disabled:opacity-60"
                onClick={() => runImport("override")}
                disabled={isImporting}
              >
                Override student list
              </button>

              <button
                type="button"
                className="w-full border border-[#ffc000] py-2 rounded-lg cursor-pointer disabled:opacity-60"
                onClick={() => {
                  setShowModeModal(false);
                  setSelectedFile(null);
                  resetFileInput();
                }}
                disabled={isImporting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
