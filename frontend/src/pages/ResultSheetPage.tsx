// ../pages/ResultSheetPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { rspInfo } from "../data/rspInfo";
import ResultSheetComponent from "../components/ResultSheetComponent";
import type { JSX } from "react";

// Destructure from rspInfo
const pos = rspInfo.pos;
const students = rspInfo.students;

// Main component for rendering the result sheet page.
export default function ResultSheetPage(): JSX.Element {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(true);
  const studentCount = students.length;

  // Memoized all COs without clustering
  const allCos = useMemo(() => pos.flatMap((po) => po.cos), []);

  // Memoized totals and thresholds for each CO.
  const coTotalsMemo = useMemo(
    () =>
      allCos.map((co) => {
        const totalMax = co.assessments.reduce((s, assessment) => s + (assessment.maxScore ?? 0), 0);
        const pass70 = Math.round(totalMax * 0.7);
        const pass80Count = Math.ceil(studentCount * 0.8);
        return { totalMax, pass70, pass80Count };
      }),
    [allCos, studentCount]
  );

  // Memoized CO analytics data.
  const coAnalytics = useMemo(() => {
    return allCos.map((co, idx) => {
      const pass70Threshold = coTotalsMemo[idx].pass70;
      const achieved = students.filter((s) => {
        const scores = s.scores[co.title] ?? [];
        const total = scores.reduce((sum, sc) => sum + (sc ?? 0), 0);
        return total >= pass70Threshold;
      }).length;
      const notAchieved = studentCount - achieved;
      const pctAch = ((achieved / studentCount) * 100).toFixed(2);
      const pctNot = ((notAchieved / studentCount) * 100).toFixed(2);
      return {
        outcome: co.title,
        achieved: `${achieved} (${pctAch}%)`,
        notAchieved: `${notAchieved} (${pctNot}%)`,
      };
    });
  }, [allCos, coTotalsMemo, studentCount]);

  return (
    <div className="bg-white text-gray-700 min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-20 bg-white h-20 flex items-center px-6 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold ml-4">COA Result Sheet</h1>
      </header>

      <main className="pt-20 flex-grow bg-white">
        <div className="w-full overflow-x-auto">
          <ResultSheetComponent />
        </div>
      </main>

      <footer
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200
              transition-transform duration-300 ${footerOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Toggle button */}
        <div
          className="absolute -top-10 right-10 w-12 h-10 rounded-tl-full rounded-tr-full
               bg-white flex items-center justify-center cursor-pointer border-t border-l border-r border-gray-300"
          onClick={() => setFooterOpen((o) => !o)}
        >
          <svg
            className={`w-5 h-5 -scale-y-100 text-gray-600 transition-transform duration-300 ${footerOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Footer content */}
        <div className="px-8 py-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-600 hover:underline font-semibold text-medium cursor-pointer"
            >
              View Analytics
            </button>
          </div>
        </div>
      </footer>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-200 bg-white z-50 p-4 overflow-y-auto shadow-xl border-l border-gray-200">
          <div className="flex items-center mb-4 pt-8 px-8">
            <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-gray-800 mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-700">Analytics</h2>
          </div>
          <hr className="border-t border-gray-300 mb-4 mx-8" />
          <h3 className="text-md font-medium mb-3 text-gray-600 pt-6 px-8">CO Attainment</h3>
          <div className="overflow-x-auto px-8">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Outcome</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">No. of Students Achieved</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">No. of Students Not Achieved</th>
                </tr>
              </thead>
              <tbody>
                {coAnalytics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{row.outcome}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{row.achieved}</td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{row.notAchieved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}