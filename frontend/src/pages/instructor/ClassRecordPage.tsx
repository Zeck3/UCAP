import AppLayout from "../../layout/AppLayout";
import ClassRecordComponent from "../../components/classrecord/ClassRecordComponent";
import { headerConfig } from "../../data/TableHeaderConfig";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileImportIcon from "../../assets/file-import-solid.svg?react";
import FileExportIcon from "../../assets/file-export-solid.svg?react";

export default function ClassRecordPage() {
  const navigate = useNavigate();
  const [footerOpen, setFooterOpen] = useState(false);
  return (
    <AppLayout activeItem="/instructor" disablePadding>
      <table className="table-auto border-0 min-w-max text-center">
        <ClassRecordComponent headerConfig={headerConfig} />
      </table>
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8 text-base text-gray-600">
              <button className="flex items-center space-x-4 hover:underline cursor-pointer">
                <FileImportIcon className="w-4 h-4 text-[#767676]" />
                <span>Import Master List</span>
              </button>
              <button className="flex items-center space-x-4 hover:underline cursor-pointer">
                <FileExportIcon className="w-4 h-4 text-[#767676]" />
                <span>Export Class Record</span>
              </button>
            </div>
            <button
              onClick={() =>
                navigate("/course_dashboard/section/course_outcome_assessment")
              }
              className="flex items-center space-x-2 bg-ucap-yellow hover:bg-ucap-yellow-hover text-white font-semibold py-2 px-4 rounded-full transition-all duration-200"
            >
              <FileExportIcon className="w-4 h-4 text-white" />
              <span>Generate COA Result Sheet</span>
            </button>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
}
