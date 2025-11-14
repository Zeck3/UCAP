import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { JSX } from "react";
import AppLayout from "../../layout/AppLayout";
import type { AssessmentPageData } from "../../types/assessmentPageTypes";
import { getAssessmentPageData } from "../../api/assessmentPageApi";

const bloomOrder = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
];

type ExpandedCW = {
  name: string;
  blooms: string;
  coIndex: number;
};

function bloomRank(b: string): number {
  const idx = bloomOrder.indexOf(b);
  return idx === -1 ? bloomOrder.length : idx;
}

function normalizeBlooms(blooms: string[]): string {
  return [...blooms].sort((a, b) => bloomRank(a) - bloomRank(b)).join("/");
}

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

function countClasswork(co: AssessmentPageData["pos"][0]["cos"][0]) {
  return Math.max(1, co.classwork.length) + 3;
}

function totalClassworkColumns(pos: AssessmentPageData["pos"]) {
  return pos.reduce(
    (sum, po) => sum + po.cos.reduce((s, co) => s + countClasswork(co), 0),
    0
  );
}

function extractCoNumbers(name: string): number[] {
  const matches = name.match(/CO(\d+)/gi);
  if (!matches) return [9999];
  return matches.map(m => parseInt(m.replace(/CO/i, '')));
}

function extractType(name: string): string {
  if (name.includes('(Lecture)')) return 'Lecture';
  if (name.includes('(Laboratory)')) return 'Laboratory';
  return 'Unknown';
}

function sortCourseOutcomes(a: { name: string }, b: { name: string }): number {
  const aNums = extractCoNumbers(a.name);
  const bNums = extractCoNumbers(b.name);
  const aType = extractType(a.name);
  const bType = extractType(b.name);

  if (aNums.length !== bNums.length) {
    return aNums.length - bNums.length;
  }

  for (let i = 0; i < aNums.length; i++) {
    if (aNums[i] !== bNums[i]) {
      return aNums[i] - bNums[i];
    }
  }

  if (aType !== bType) {
    return aType === 'Lecture' ? -1 : 1;
  }

  return 0;
}

function extractPOShortName(poName: string): string {
  const match = poName.match(/^([a-zA-Z])\s*-\s*/);
  return match ? `PO-${match[1]}` : poName;
}

function formatCOLabel(coName: string, counter: number): string {
  const coMatches = coName.match(/CO\d+/gi);
  const coNumbers = coMatches && coMatches.length > 0
    ? coMatches.map(m => m.toUpperCase()).join(' & ')
    : `CO${counter}`;

  const typeMatch = coName.match(/\((Lecture|Laboratory)\)/i);
  const type = typeMatch ? typeMatch[1] : '';

  return type ? `${coNumbers} (${type})` : coNumbers;
}

function groupBloomsBySequence(clustered: ExpandedCW[]): { bloom: string; count: number }[] {
  const grouped: { bloom: string; count: number }[] = [];
  let prev: string | null = null;
  
  for (const item of clustered.length ? clustered : [{ name: "", blooms: "", coIndex: -1 }]) {
    if (item.blooms === prev) {
      grouped[grouped.length - 1].count++;
    } else {
      grouped.push({ bloom: item.blooms, count: 1 });
      prev = item.blooms;
    }
  }
  
  return grouped;
}

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
      className="border border-[#E9E6E6] align-middle min-w-14 h-40"
    >
      <div className="h-full flex items-center justify-center">
        <span className="text-xs leading-tight wrap-break-word whitespace-normal [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180">
          {cw.name}
        </span>
      </div>
    </td>
  );
}

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
      className="border border-[#E9E6E6] px-3 py-2 text-center min-w-14"
    >
      {val}
    </td>
  );
}

export default function ResultSheetPage(): JSX.Element {
  const { section_id } = useParams<{ section_id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const [data, setData] = useState<AssessmentPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessmentPage = async () => {
      try {
        setLoading(true);
        if (!section_id) return;
        const response = await getAssessmentPageData(Number(section_id));
        
        const filteredStudents = response.students.filter((student) => {
          const hasValidId = student.id && /^\d{10}$/.test(student.id);
          const hasValidName = student.name?.trim().length > 0;
          return hasValidId && hasValidName;
        });
        
        setData({ ...response, students: filteredStudents });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load assessment page";
        setError(message || "Failed to load assessment page");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentPage();
  }, [section_id]);

  const studentCount = data?.students.length ?? 0;
  const totalColumns = 4 + totalClassworkColumns(data?.pos ?? []);

  const layout = useMemo(() => {
    const pos = data?.pos ?? [];

    const filteredPOs = pos
      .map((po) => {
        const filteredCOs = po.cos
          .map((co) => {
            const validClasswork =
              co.classwork?.filter(
                (cw) => cw && cw.maxScore != null
              ) ?? [];

            if (validClasswork.length === 0) return null;

            const expanded: ExpandedCW[] = validClasswork.map((cw, idx) => ({
              name: cw.name,
              blooms: normalizeBlooms(cw.blooms),
              coIndex: idx,
            }));

            const clustered = clusterBlooms(expanded);

            return { ...co, classwork: validClasswork, clustered };
          })
          .filter((co): co is NonNullable<typeof co> => co != null);

        if (filteredCOs.length === 0) return null;

        return { ...po, cos: filteredCOs };
      })
      .filter((po): po is NonNullable<typeof po> => po != null);

    const numPOs = filteredPOs.length;
    const parent = Array.from({ length: numPOs }, (_, i) => i);

    function find(x: number): number {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    }

    function union(x: number, y: number) {
      const px = find(x),
        py = find(y);
      if (px !== py) parent[px] = py;
    }

    const coToPOs: Map<string, number[]> = new Map();
    for (let i = 0; i < numPOs; i++) {
      for (const co of filteredPOs[i].cos) {
        const name = co.name;
        if (!coToPOs.has(name)) coToPOs.set(name, []);
        coToPOs.get(name)!.push(i);
      }
    }

    for (const poList of coToPOs.values()) {
      for (let j = 1; j < poList.length; j++) {
        union(poList[0], poList[j]);
      }
    }

    const components: Map<number, number[]> = new Map();
    for (let i = 0; i < numPOs; i++) {
      const root = find(i);
      if (!components.has(root)) components.set(root, []);
      components.get(root)!.push(i);
    }

    const mergedLayout: typeof filteredPOs = [];
    for (const poIndices of components.values()) {
      const posInComp = poIndices.map((idx) => filteredPOs[idx]);

      const shortNames = posInComp
        .map((po) => extractPOShortName(po.name))
        .sort();

      const mergedName = shortNames.join(", ");

      const coMap: Map<string, (typeof filteredPOs)[0]["cos"][0]> = new Map();
      for (const po of posInComp) {
        for (const co of po.cos) {
          if (!coMap.has(co.name)) {
            coMap.set(co.name, co);
          }
        }
      }

      const uniqueCos = Array.from(coMap.values());

      uniqueCos.sort(sortCourseOutcomes);

      mergedLayout.push({ name: mergedName, cos: uniqueCos });
    }

    mergedLayout.sort((a, b) => {
      const aFirst = a.name.split(", ")[0];
      const bFirst = b.name.split(", ")[0];
      return aFirst.localeCompare(bFirst);
    });

    return mergedLayout;
  }, [data]);

  const coTotalsMemo = useMemo(
    () =>
      layout.flatMap((po) =>
        po.cos.map((co) => {
          const totalMax = co.classwork.reduce(
            (s, cw) => s + (cw.maxScore ?? 0),
            0
          );
          const pass70 = Math.round(totalMax * 0.7);
          const pass80Count = Math.ceil(studentCount * 0.8);
          return { totalMax, pass70, pass80Count };
        })
      ),
    [layout, studentCount]
  );

  const coAnalytics = useMemo(() => {
    const allCos = layout.flatMap((po) => po.cos);
    return allCos.map((co, idx) => {
      const pass70Threshold = coTotalsMemo[idx].pass70;
      const achieved = (data?.students ?? []).filter((s) => {
        const scores = s.scores[co.name] ?? [];
        const total = scores.reduce((sum, sc) => sum + (sc?.raw ?? 0), 0);
        return total >= pass70Threshold;
      }).length;
      const notAchieved = studentCount - achieved;
      const pctAch = ((achieved / studentCount) * 100).toFixed(2);
      const pctNot = ((notAchieved / studentCount) * 100).toFixed(2);
      return {
        outcome: co.name,
        achieved: `${achieved} (${pctAch}%)`,
        notAchieved: `${notAchieved} (${pctNot}%)`,
      };
    });
  }, [layout, coTotalsMemo, studentCount, data]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  const hasPos = Array.isArray(data?.pos) && data!.pos.length > 0;
  const hasStudents = Array.isArray(data?.students) && data!.students.length > 0;
  if (!data || !hasPos || !hasStudents) {
    return (
      <div className="px-6 py-6 text-center text-coa-red">
        No data available to display.
      </div>
    );
  }

  const poCells = layout.map((po, pIdx) => {
    const span = po.cos.reduce((s, co) => s + countClasswork(co), 0);
    const shortLabel = extractPOShortName(po.name);

    return (
      <td
        key={`po-${pIdx}`}
        colSpan={span}
        className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold whitespace-nowrap"
      >
        {shortLabel}
      </td>
    );
  });

  let coCounter = 1;
  const coCells = layout.flatMap((po, pIdx) =>
    po.cos.map((co, cIdx) => {
      const span = countClasswork(co);
      const shortLabel = formatCOLabel(co.name, coCounter++);

      return (
        <td
          key={`co-${pIdx}-${cIdx}`}
          colSpan={span}
          className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold text-coa-red bg-coa-yellow whitespace-nowrap"
          title={co.name}
        >
          {shortLabel}
        </td>
      );
    })
  );

  return (
    <AppLayout activeItem="/instructor" disablePadding>
      <table className="table-auto border-collapse w-full -ml-px -mt-px">
        <tbody>
          {[
            ["Campus/College/Department:", data.classInfo.cacode],
            ["Program:", data.classInfo.program],
            ["Course:", data.classInfo.course],
            ["AY/Semester:", data.classInfo.aySemester],
            ["Faculty:", data.classInfo.faculty],
          ].map(([label, value], idx) => (
            <tr key={idx}>
              <td
                className="border border-[#E9E6E6] px-3 py-2 font-medium min-w-[220px]"
                colSpan={3}
              >
                {label}
              </td>
              <td
                className="border border-[#E9E6E6] px-3 py-2"
                colSpan={totalColumns - 3}
              >
                {value}
              </td>
            </tr>
          ))}

          {/* Assessment title row */}
          <tr>
            <td
              colSpan={totalColumns}
              className="border border-[#E9E6E6] px-3 py-2 text-center font-medium"
            >
              Assessment Result Sheet
            </td>
          </tr>

          {/* PO header row */}
          <tr>
            <td
              className="border border-[#E9E6E6] px-3 py-2 font-medium min-w-[220px]"
              colSpan={3}
            >
              Result Status: (Completed or Not)
            </td>
            <td
              className="border border-[#E9E6E6] px-2 py-2 text-center font-medium align-top min-w-[35px]"
              rowSpan={5 + studentCount}
            ></td>
            {poCells}
          </tr>

          <tr>
            <td
              className="border border-[#E9E6E6] px-3 py-2 font-medium align-top min-w-[220px]"
              rowSpan={3}
              colSpan={3}
            >
              Remarks:
            </td>
            {coCells}
          </tr>

          <tr>
            {layout.flatMap((po, pIdx) =>
              po.cos.flatMap((co, cIdx) => {
                const grouped = groupBloomsBySequence(co.clustered);
                
                return [
                  ...grouped.map((g, gIdx) => (
                    <td
                      key={`blooms-${pIdx}-${cIdx}-${gIdx}`}
                      className="border border-[#E9E6E6] px-3 py-2 text-center italic wrap-break-word whitespace-normal"
                      colSpan={g.count}
                    >
                      {g.bloom}
                    </td>
                  )),
                  <td
                    key={`blooms-kpi-${pIdx}-${cIdx}`}
                    className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold"
                    colSpan={3}
                  >
                    KPI
                  </td>,
                ];
              })
            )}
          </tr>

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
                    className="border border-[#E9E6E6] px-2 py-2 text-center font-semibold min-w-[50px]"
                  >
                    Total
                  </td>,
                  <td
                    key={`cw-pass70-${pIdx}-${cIdx}`}
                    className="border border-[#E9E6E6] px-2 py-2 text-center text-sm min-w-14"
                  >
                    Passing (70%)
                  </td>,
                  <td
                    key={`cw-pass80-${pIdx}-${cIdx}`}
                    className="border border-[#E9E6E6] px-2 py-2 text-center text-sm min-w-14"
                  >
                    Passing (80%)
                  </td>
                );

                return cwCells;
              })
            )}
          </tr>

          <tr>
            <td className="border border-[#E9E6E6] px-3 py-2 text-left font-medium">
              No.
            </td>
            <td className="border border-[#E9E6E6] px-3 py-2 text-left font-medium">
              Student ID
            </td>
            <td className="border border-[#E9E6E6] px-3 py-2 text-left font-medium">
              Name
            </td>
            {(() => {
              let index = 0;
              return layout.flatMap((po, pIdx) =>
                po.cos.flatMap((co, cIdx) => {
                  const { totalMax, pass70, pass80Count } =
                    coTotalsMemo[index++];

                  const maxCells = co.clustered.map((cw, cwIdx) => {
                    const maxVal = co.classwork[cw.coIndex]?.maxScore ?? "";
                    return (
                      <td
                        key={`max-${pIdx}-${cIdx}-${cwIdx}`}
                        className="border border-[#E9E6E6] px-3 py-2 text-center text-coa-blue min-w-14 "
                      >
                        {maxVal}
                      </td>
                    );
                  });

                  maxCells.push(
                    <td
                      key={`max-total-${pIdx}-${cIdx}`}
                      className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold text-coa-blue"
                    >
                      {totalMax}
                    </td>,
                    <td
                      key={`max-pass70-${pIdx}-${cIdx}`}
                      className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold text-coa-blue"
                    >
                      {pass70}
                    </td>,
                    <td
                      key={`max-pass80-${pIdx}-${cIdx}`}
                      className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold text-coa-blue"
                    >
                      {pass80Count}
                    </td>
                  );

                  return maxCells;
                })
              );
            })()}
          </tr>

          {data.students.map((student, sIdx) => (
            <tr key={student.id}>
              <td className="border border-[#E9E6E6] px-3 py-2 text-left">
                {sIdx + 1}
              </td>
              <td className="border border-[#E9E6E6] px-3 py-2 text-left">
                {student.id}
              </td>
              <td className="border border-[#E9E6E6] px-3 py-2 whitespace-nowrap text-left">
                {student.name}
              </td>
              {(() => {
                let index = 0;
                return layout.flatMap((po, pIdx) =>
                  po.cos.flatMap((co, cIdx) => {
                    const studentScores = student.scores[co.name] ?? [];
                    const { pass70: pass70Threshold, pass80Count } =
                      coTotalsMemo[index++];

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

                      const pass70Count = data.students.filter((s) => {
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
                          className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold text-coa-blue"
                        >
                          {studentTotal}
                        </td>,
                        <td
                          key={`student-pass70-${student.id}-${pIdx}-${cIdx}`}
                          className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold"
                        >
                          {pass70 ? (
                            <span>YES</span>
                          ) : (
                            <span className="text-coa-red">NO</span>
                          )}
                        </td>
                      );

                      if (sIdx === 0) {
                        scoreCells.push(
                          <td
                            key={`student-pass80-${pIdx}-${cIdx}`}
                            className="border border-[#E9E6E6] px-3 py-2 text-center font-semibold"
                            rowSpan={studentCount}
                          >
                            {pass80 ? (
                              <span>YES</span>
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
                          className="border border-[#E9E6E6] px-3 py-2 text-center"
                        />,
                        <td
                          key={`student-pass70-${student.id}-${pIdx}-${cIdx}`}
                          className="border border-[#E9E6E6] px-3 py-2 text-center"
                        />,
                        ...(sIdx === 0
                          ? [
                              <td
                                key={`student-pass80-${pIdx}-${cIdx}`}
                                className="border border-[#E9E6E6] px-3 py-2 text-center"
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

      <footer
        className={`fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200
              transition-transform duration-300 ${
                footerOpen ? "translate-y-0" : "translate-y-full"
              }`}
      >
        <div
          className="absolute -top-10 right-10 w-12 h-10 rounded-tl-full rounded-tr-full
               bg-white flex items-center justify-center cursor-pointer border-t border-l border-r border-gray-300"
          onClick={() => setFooterOpen((o) => !o)}
        >
          <svg
            className={`w-5 h-5 -scale-y-100 text-gray-600 transition-transform duration-300 ${
              footerOpen ? "rotate-180" : ""
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
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-600 hover:underline font-semibold text-medium cursor-pointer"
            >
              View Analytics
            </button>
          </div>
        </div>
      </footer>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[2700]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-250 bg-white z-[2800] p-4 overflow-y-auto shadow-xl border-l border-gray-200">
          <div className="flex items-center mb-4 pt-8 px-8">
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-800 mr-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-700">Analytics</h2>
          </div>
          <hr className="border-t border-gray-300 mb-4 mx-8" />
          <h3 className="text-md font-medium mb-3 text-gray-600 pt-6 px-8">
            CO Attainment
          </h3>
          <div className="overflow-x-auto px-8">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    Outcome
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    No. of Students Achieved
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                    No. of Students Not Achieved
                  </th>
                </tr>
              </thead>
              <tbody>
                {coAnalytics.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {row.outcome}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {row.achieved}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {row.notAchieved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
