// src/pages/ResultSheetPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { classInfo, pos, students } from "../data/rspInfo";
import type { JSX } from "react";

// Array defining the order of Bloom's taxonomy levels for sorting.
const bloomOrder = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

// Function to get the rank of a Bloom's level for sorting purposes.
function bloomRank(b: string): number {
  const idx = bloomOrder.indexOf(b);
  return idx === -1 ? bloomOrder.length : idx;
}

// Function to normalize and sort Bloom's levels into a string.
function normalizeBlooms(blooms: string[]): string {
  return [...blooms].sort((a, b) => bloomRank(a) - bloomRank(b)).join("/");
}

// Utility function to count columns needed for a course outcome, including extras.
function countClasswork(co: typeof pos[0]["cos"][0]) {
  return Math.max(1, co.classwork.length) + 3; // +3 for Total, 70%, 80%
}

// Utility function to calculate total classwork columns across all POs.
function totalClassworkColumns() {
  return pos.reduce((sum, po) => sum + po.cos.reduce((s, co) => s + countClasswork(co), 0), 0);
}

// Type for expanded classwork items with additional metadata.
type ExpandedCW = {
  name: string;
  blooms: string;
  coIndex: number;
};

// Function to sort classwork items by normalized Bloom's levels using rank comparison.
function clusterBlooms(items: ExpandedCW[]): ExpandedCW[] {
  if (!items.length) return [];
  return [...items].sort((a, b) => {
    const aSplit = a.blooms ? a.blooms.split("/") : [];
    const bSplit = b.blooms ? b.blooms.split("/") : [];
    const aRanks = aSplit.map(bloomRank);
    const bRanks = bSplit.map(bloomRank);
    for (let i = 0; i < Math.min(aRanks.length, bRanks.length); i++) {
      if (aRanks[i] !== bRanks[i]) return aRanks[i] - bRanks[i];
    }
    return aRanks.length - bRanks.length;
  });
}

// Component for rendering classwork name cells with vertical orientation.
function ClassworkNameCell({
  cw,
  pIdx,
  cIdx,
  cwIdx,
}: {
  cw: ExpandedCW;
  pIdx: number;
  cIdx: number;
  cwIdx: number;
}): JSX.Element {
  return (
    <td
      key={`cw-${pIdx}-${cIdx}-${cwIdx}`}
      className="border border-coa-gray align-middle min-w-[56px] h-[160px]"
    >
      <div className="h-full flex items-center justify-center">
        <span
          className="text-xs leading-tight break-words whitespace-normal [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180"
        >
          {cw.name}
        </span>
      </div>
    </td>
  );
}

// Component for rendering student score cells.
function StudentScoreCell({
  val,
  studentId,
  pIdx,
  cIdx,
  cwIdx,
}: {
  val: number | string;
  studentId: string;
  pIdx: number;
  cIdx: number;
  cwIdx: number;
}): JSX.Element {
  return (
    <td
      key={`score-${studentId}-${pIdx}-${cIdx}-${cwIdx}`}
      className="border border-coa-gray px-3 py-2 text-center min-w-[56px]"
    >
      {val}
    </td>
  );
}

// Main component for rendering the result sheet page.
export default function ResultSheetPage(): JSX.Element {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(true);
  const totalColumns = 4 + totalClassworkColumns();
  const studentCount = students.length;

  // Memoized layout preparation by clustering classwork for each CO.
  const layout = useMemo(
    () =>
      pos.map((po) => ({
        ...po,
        cos: po.cos.map((co) => {
          const expanded: ExpandedCW[] = co.classwork.map((cw, idx) => ({
            name: cw.name,
            blooms: normalizeBlooms(cw.blooms),
            coIndex: idx,
          }));
          const clustered = clusterBlooms(expanded);
          return { ...co, clustered };
        }),
      })),
    []
  );

  // Memoized totals and thresholds for each CO.
  const coTotalsMemo = useMemo(
    () =>
      layout.flatMap((po) =>
        po.cos.map((co) => {
          const totalMax = co.classwork.reduce((s, cw) => s + (cw.maxScore ?? 0), 0);
          const pass70 = Math.round(totalMax * 0.7);
          const pass80Count = Math.ceil(studentCount * 0.8);
          return { totalMax, pass70, pass80Count };
        })
      ),
    [layout, studentCount]
  );

  // Memoized CO analytics data.
  const coAnalytics = useMemo(() => {
    const allCos = layout.flatMap((po) => po.cos);
    return allCos.map((co, idx) => {
      const pass70Threshold = coTotalsMemo[idx].pass70;
      const achieved = students.filter((s) => {
        const scores = s.scores[co.name] ?? [];
        const total = scores.reduce((sum, sc) => sum + (sc?.raw ?? 0), 0);
        return total >= pass70Threshold;
      }).length;
      const notAchieved = studentCount - achieved;
      const pctAch = ((achieved / studentCount) * 100).toFixed(1);
      const pctNot = ((notAchieved / studentCount) * 100).toFixed(1);
      return {
        outcome: co.name,
        achieved: `${achieved} (${pctAch}%)`,
        notAchieved: `${notAchieved} (${pctNot}%)`,
      };
    });
  }, [layout, coTotalsMemo, studentCount]);

  // Early return if no data is available.
  if (!pos.length || !students.length) {
    return <div className="px-6 py-6 text-center text-coa-red">No data available to display.</div>;
  }

  // Precompute PO cells for rendering.
  const poCells = layout.map((po, pIdx) => {
    const span = po.cos.reduce((s, co) => s + countClasswork(co), 0);
    return (
      <td
        key={`po-${pIdx}`}
        colSpan={span}
        className="border border-coa-gray px-3 py-2 text-center font-semibold break-words whitespace-normal"
      >
        {po.name}
      </td>
    );
  });

  // Precompute CO cells for rendering.
  const coCells = layout.flatMap((po, pIdx) =>
    po.cos.map((co, cIdx) => {
      const span = countClasswork(co);
      return (
        <td
          key={`co-${pIdx}-${cIdx}`}
          colSpan={span}
          className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-red bg-coa-yellow break-words whitespace-normal"
        >
          {co.name}
        </td>
      );
    })
  );

  return (
    <div className="bg-gray-50 text-gray-700 min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-20 bg-white h-20 flex items-center px-6 border border-gray-200 ">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold ml-4">COA Result Sheet</h1>
      </header>

      <main className="pt-19.5 flex-grow">
        <div className="bg-white">
          <table className="table-auto border-collapse w-full">
            <tbody>
              {/* Rows for displaying class information. */}
              {[
                ["Campus/College/Department:", classInfo.cacode],
                ["Program:", classInfo.program],
                ["Course:", classInfo.course],
                ["AY/Semester:", classInfo.aySemester],
                ["Faculty:", classInfo.faculty],
              ].map(([label, value], idx) => (
                <tr key={idx}>
                  <td
                    className="border border-coa-gray px-3 py-2 font-medium min-w-[220px]"
                    colSpan={3}
                  >
                    {label}
                  </td>
                  <td
                    className="border border-coa-gray px-3 py-2"
                    colSpan={totalColumns - 3}
                  >
                    {value}
                  </td>
                </tr>
              ))}

              {/* Spacer row for visual separation. */}
              <tr>
                <td colSpan={totalColumns} className="border border-coa-gray px-3 py-6" />
              </tr>

              {/* Title row for the assessment result sheet. */}
              <tr>
                <td
                  colSpan={totalColumns}
                  className="border border-coa-gray px-3 py-2 text-center font-medium"
                >
                  Assessment Result Sheet
                </td>
              </tr>

              {/* Row for program outcomes (POs). */}
              <tr>
                <td
                  className="border border-coa-gray px-3 py-2 font-medium min-w-[220px]"
                  colSpan={3}
                >
                  Result Status: (Completed or Not)
                </td>

                {/* Empty cell for alignment. */}
                <td
                  className="border border-coa-gray px-2 py-2 text-center font-medium align-top min-w-[35px]"
                  rowSpan={5 + studentCount}
                ></td>

                {poCells}
              </tr>

              {/* Row for course outcomes (COs). */}
              <tr>
                <td
                  className="border border-coa-gray px-3 py-2 font-medium align-top min-w-[220px]"
                  rowSpan={3}
                  colSpan={3}
                >
                  Remarks:
                </td>
                {coCells}
              </tr>

              {/* Row for Bloom's levels and KPI headers. */}
              <tr>
                {layout.flatMap((po, pIdx) =>
                  po.cos.flatMap((co, cIdx) => {
                    const grouped: { bloom: string; count: number }[] = [];
                    let prev: string | null = null;
                    for (const item of co.clustered.length ? co.clustered : [{ name: "", blooms: "" as string, coIndex: -1 }]) {
                      if (item.blooms === prev) {
                        grouped[grouped.length - 1].count++;
                      } else {
                        grouped.push({ bloom: item.blooms, count: 1 });
                        prev = item.blooms;
                      }
                    }
                    return [
                      ...grouped.map((g, gIdx) => (
                        <td
                          key={`blooms-${pIdx}-${cIdx}-${gIdx}`}
                          className="border border-coa-gray px-3 py-2 text-center italic break-words whitespace-normal"
                          colSpan={g.count}
                        >
                          {g.bloom}
                        </td>
                      )),
                      <td
                        key={`blooms-kpi-${pIdx}-${cIdx}`}
                        className="border border-coa-gray px-3 py-2 text-center font-semibold"
                        colSpan={3}
                      >
                        KPI
                      </td>,
                    ];
                  })
                )}
              </tr>

              {/* Row for classwork names with vertical text orientation. */}
              <tr>
                {layout.flatMap((po, pIdx) =>
                  po.cos.flatMap((co, cIdx) => {
                    const cwCells = co.clustered.map((cw, cwIdx) => (
                      <ClassworkNameCell
                        key={`cw-${pIdx}-${cIdx}-${cwIdx}`}
                        cw={cw}
                        pIdx={pIdx}
                        cIdx={cIdx}
                        cwIdx={cwIdx}
                      />
                    ));

                    cwCells.push(
                      <td
                        key={`cw-total-${pIdx}-${cIdx}`}
                        className="border border-coa-gray px-2 py-2 text-center font-semibold text-gray-600 min-w-[50px]"
                      >
                        Total
                      </td>,
                      <td
                        key={`cw-pass70-${pIdx}-${cIdx}`}
                        className="border border-coa-gray px-2 py-2 text-center text-sm min-w-[56px]"
                      >
                        Passing (70%)
                      </td>,
                      <td
                        key={`cw-pass80-${pIdx}-${cIdx}`}
                        className="border border-coa-gray px-2 py-2 text-center text-sm min-w-[56px]"
                      >
                        Passing (80%)
                      </td>
                    );

                    return cwCells;
                  })
                )}
              </tr>

              {/* Row for maximum scores and thresholds. */}
              <tr>
                <td className="border border-coa-gray px-3 py-2 text-center font-medium">
                  No.
                </td>
                <td className="border border-coa-gray px-3 py-2 text-center font-medium">
                  Student ID
                </td>
                <td className="border border-coa-gray px-3 py-2 text-center font-medium">
                  Name
                </td>

                {(() => {
                  let index = 0;
                  return layout.flatMap((po, pIdx) =>
                    po.cos.flatMap((co, cIdx) => {
                      const { totalMax, pass70, pass80Count } = coTotalsMemo[index++];

                      const maxCells = co.clustered.map((cw, cwIdx) => {
                        const maxVal = co.classwork[cw.coIndex]?.maxScore ?? "";
                        return (
                          <td
                            key={`max-${pIdx}-${cIdx}-${cwIdx}`}
                            className="border border-coa-gray px-3 py-2 text-center text-coa-blue min-w-[56px] "
                          >
                            {maxVal}
                          </td>
                        );
                      });

                      maxCells.push(
                        <td
                          key={`max-total-${pIdx}-${cIdx}`}
                          className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                        >
                          {totalMax}
                        </td>,
                        <td
                          key={`max-pass70-${pIdx}-${cIdx}`}
                          className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                        >
                          {pass70}
                        </td>,
                        <td
                          key={`max-pass80-${pIdx}-${cIdx}`}
                          className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                        >
                          {pass80Count}
                        </td>
                      );

                      return maxCells;
                    })
                  );
                })()}
              </tr>

              {/* Rows for student data, scores, and pass/fail indicators. */}
              {students.map((student, sIdx) => (
                <tr key={student.id}>
                  <td className="border border-coa-gray px-3 py-2 text-center">
                    {sIdx + 1}
                  </td>
                  <td className="border border-coa-gray px-3 py-2 text-center">
                    {student.id}
                  </td>
                  <td className="border border-coa-gray px-3 py-2 whitespace-nowrap">
                    {student.name}
                  </td>

                  {(() => {
                    let index = 0;
                    return layout.flatMap((po, pIdx) =>
                      po.cos.flatMap((co, cIdx) => {
                        const studentScores = student.scores[co.name] ?? [];
                        const { pass70: pass70Threshold, pass80Count } = coTotalsMemo[index++];

                        const scoreCells = co.clustered.map((cw, cwIdx) => {
                          const val = studentScores[cw.coIndex]?.raw ?? "";
                          return (
                            <StudentScoreCell
                              key={`score-${student.id}-${pIdx}-${cIdx}-${cwIdx}`}
                              val={val}
                              studentId={student.id}
                              pIdx={pIdx}
                              cIdx={cIdx}
                              cwIdx={cwIdx}
                            />
                          );
                        });

                        if (studentScores.length > 0) {
                          const studentTotal = studentScores.reduce(
                            (sum, sc) => sum + (sc?.raw ?? 0),
                            0
                          );
                          const pass70 = studentTotal >= pass70Threshold;

                          const pass70Count = students.filter((s) => {
                            const total = (s.scores[co.name] ?? []).reduce(
                              (sum, sc) => sum + (sc?.raw ?? 0),
                              0
                            );
                            return total >= pass70Threshold;
                          }).length;
                          const pass80 = pass70Count >= pass80Count;

                          scoreCells.push(
                            <td
                              key={`student-total-${student.id}-${pIdx}-${cIdx}`}
                              className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                            >
                              {studentTotal}
                            </td>,
                            <td
                              key={`student-pass70-${student.id}-${pIdx}-${cIdx}`}
                              className="border border-coa-gray px-3 py-2 text-center font-semibold"
                            >
                              {pass70 ? (
                                <span className="text-black">YES</span>
                              ) : (
                                <span className="text-coa-red">NO</span>
                              )}
                            </td>
                          );

                          if (sIdx === 0) {
                            scoreCells.push(
                              <td
                                key={`student-pass80-${pIdx}-${cIdx}`}
                                className="border border-coa-gray px-3 py-2 text-center font-semibold"
                                rowSpan={studentCount}
                              >
                                {pass80 ? (
                                  <span className="text-black">YES</span>
                                ) : (
                                  <span className="text-coa-red">NO</span>
                                )}
                              </td>
                            );
                          }
                        } else {
                          scoreCells.push(
                            <td
                              key={`student-total-${student.id}-${pIdx}-${cIdx}`}
                              className="border border-coa-gray px-3 py-2 text-center"
                            />,
                            <td
                              key={`student-pass70-${student.id}-${pIdx}-${cIdx}`}
                              className="border border-coa-gray px-3 py-2 text-center"
                            />,
                            ...(sIdx === 0
                              ? [
                                <td
                                  key={`student-pass80-${pIdx}-${cIdx}`}
                                  className="border border-coa-gray px-3 py-2 text-center"
                                  rowSpan={studentCount}
                                />,
                              ]
                              : [])
                          );
                        }

                        return scoreCells;
                      })
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <footer
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200
              transition-transform duration-300 ${footerOpen ? "translate-y-0" : "translate-y-full"
          }`}
      >
        {/* Toggle button */}
        <div
          className="absolute -top-10 right-10 w-12 h-10 rounded-tl-full rounded-tr-full
               bg-white flex items-center justify-center cursor-pointer border-t border-l border-r border-gray-300"
          onClick={() => setFooterOpen((o) => !o)}
        >
          <svg
            className={`w-5 h-5 -scale-y-100 text-gray-600 transition-transform duration-300 ${footerOpen ? "rotate-180" : ""
              }`}
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
        <div className="fixed right-0 top-0 h-full w-250 bg-white z-50 p-4 overflow-y-auto shadow-xl border-l border-gray-200">
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