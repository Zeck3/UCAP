// ../components/ResultSheetComponent.tsx
import { useMemo } from "react";
import { rspInfo } from "../data/rspInfo"; // Adjusted import to use rspInfo directly
import type { JSX } from "react";

// Destructure from rspInfo
const classInfo = rspInfo.info;
const pos = rspInfo.pos;
const students = rspInfo.students;

// Map defining explicit weights for Bloom's taxonomy levels (lowest for Remember, highest for Create).
const bloomWeights = new Map<string, number>([
  ["Remember", 0],
  ["Understand", 1],
  ["Apply", 2],
  ["Analyze", 3],
  ["Evaluate", 4],
  ["Create", 5],
]);

// Function to get the weight of a Bloom's level for sorting purposes.
function bloomRank(b: string): number {
  return bloomWeights.get(b) ?? 6; // Default to a value higher than Create for unknowns.
}

// Function to normalize and sort Bloom's levels into a string.
function normalizeBlooms(blooms: string[]): string {
  return [...blooms].sort((a, b) => bloomRank(a) - bloomRank(b)).join("/");
}

// Utility function to count columns needed for a course outcome, including extras.
function countAssessment(co: typeof pos[0]["cos"][0]) {
  return Math.max(1, co.assessments.length) + 3; // +3 for Total, 70%, 80%
}

// Utility function to calculate total assessment columns across all POs.
function totalAssessmentColumns() {
  return pos.reduce((sum, po) => sum + po.cos.reduce((s, co) => s + countAssessment(co), 0), 0);
}

// Type for expanded assessment items with additional metadata.
type AssessmentMetadata = {
  title: string;
  blooms: string;
  coIndex: number;
};

// Function to sort assessment items by normalized Bloom's levels using rank comparison.
// Updated to sort primarily by max rank (ascending), then by min rank (ascending), then by full rank array.
function clusterBlooms(items: AssessmentMetadata[]): AssessmentMetadata[] {
  if (!items.length) return [];
  return [...items].sort((a, b) => {
    const aSplit = a.blooms ? a.blooms.split("/") : [];
    const bSplit = b.blooms ? b.blooms.split("/") : [];
    const aRanks = aSplit.map(bloomRank);
    const bRanks = bSplit.map(bloomRank);

    const aMax = aRanks.length ? aRanks[aRanks.length - 1] : -1;
    const bMax = bRanks.length ? bRanks[bRanks.length - 1] : -1;
    if (aMax !== bMax) return aMax - bMax;

    const aMin = aRanks.length ? aRanks[0] : -1;
    const bMin = bRanks.length ? bRanks[0] : -1;
    if (aMin !== bMin) return aMin - bMin; // Ascending min (lower min first)

    // If still equal, compare the full arrays
    for (let i = 0; i < Math.min(aRanks.length, bRanks.length); i++) {
      if (aRanks[i] !== bRanks[i]) return aRanks[i] - bRanks[i];
    }
    return aRanks.length - bRanks.length;
  });
}

// Component for rendering assessment title cells with vertical orientation.
function AssessmentNameCell({
  assessment,
  programIndex,
  courseIndex,
  assessmentIndex,
}: {
  assessment: AssessmentMetadata;
  programIndex: number;
  courseIndex: number;
  assessmentIndex: number;
}): JSX.Element {
  return (
    <td
      key={`assessment-${programIndex}-${courseIndex}-${assessmentIndex}`}
      className="border border-coa-gray align-middle min-w-[56px] h-[160px]"
    >
      <div className="h-full flex items-center justify-center">
        <span
          className="text-xs leading-tight break-words whitespace-normal [writing-mode:vertical-rl] [text-orientation:mixed] rotate-180"
        >
          {assessment.title}
        </span>
      </div>
    </td>
  );
}

// Component for rendering student score cells.
function StudentScoreCell({
  val,
  studentId,
  programIndex,
  courseIndex,
  assessmentIndex,
}: {
  val: number | string;
  studentId: string;
  programIndex: number;
  courseIndex: number;
  assessmentIndex: number;
}): JSX.Element {
  return (
    <td
      key={`score-${studentId}-${programIndex}-${courseIndex}-${assessmentIndex}`}
      className="border border-coa-gray px-3 py-2 text-center min-w-[56px]"
    >
      {val}
    </td>
  );
}

export default function ResultSheetComponent(): JSX.Element {
  const totalColumns = 4 + totalAssessmentColumns();
  const studentCount = students.length;

  // Memoized layout preparation by clustering assessment for each CO.
  const layout = useMemo(
    () =>
      pos.map((po) => ({
        ...po,
        cos: po.cos.map((co) => {
          const expanded: AssessmentMetadata[] = co.assessments.map((assessment, idx) => ({
            title: assessment.title,
            blooms: normalizeBlooms(assessment.blooms),
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
          const totalMax = co.assessments.reduce((s, assessment) => s + (assessment.maxScore ?? 0), 0);
          const pass70 = Math.round(totalMax * 0.7);
          const pass80Count = Math.ceil(studentCount * 0.8);
          return { totalMax, pass70, pass80Count };
        })
      ),
    [layout, studentCount]
  );

  // Early return if no data is available.
  if (!pos.length || !students.length) {
    return <div className="px-6 py-6 text-center text-coa-red">No data available to display.</div>;
  }

  // Precompute PO cells for rendering.
  const poCells = layout.map((po, programIndex) => {
    const span = po.cos.reduce((s, co) => s + countAssessment(co), 0);
    return (
      <td
        key={`po-${programIndex}`}
        colSpan={span}
        className="border border-coa-gray px-3 py-2 text-center font-semibold break-words whitespace-normal"
      >
        {po.title}
      </td>
    );
  });

  // Precompute CO cells for rendering.
  const coCells = layout.flatMap((po, programIndex) =>
    po.cos.map((co, courseIndex) => {
      const span = countAssessment(co);
      return (
        <td
          key={`co-${programIndex}-${courseIndex}`}
          colSpan={span}
          className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-red bg-coa-yellow break-words whitespace-normal"
        >
          {co.title}
        </td>
      );
    })
  );

  return (
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
            {layout.flatMap((po, programIndex) =>
              po.cos.flatMap((co, courseIndex) => {
                const grouped: { bloom: string; count: number }[] = [];
                let prev: string | null = null;
                for (const item of co.clustered.length ? co.clustered : [{ title: "", blooms: "" as string, coIndex: -1 }]) {
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
                      key={`blooms-${programIndex}-${courseIndex}-${gIdx}`}
                      className="border border-coa-gray px-3 py-2 text-center italic break-words whitespace-normal"
                      colSpan={g.count}
                    >
                      {g.bloom}
                    </td>
                  )),
                  <td
                    key={`blooms-kpi-${programIndex}-${courseIndex}`}
                    className="border border-coa-gray px-3 py-2 text-center font-semibold"
                    colSpan={3}
                  >
                    KPI
                  </td>,
                ];
              })
            )}
          </tr>

          {/* Row for assessment titles with vertical text orientation. */}
          <tr>
            {layout.flatMap((po, programIndex) =>
              po.cos.flatMap((co, courseIndex) => {
                const assessmentCells = co.clustered.map((assessment, assessmentIndex) => (
                  <AssessmentNameCell
                    key={`assessment-${programIndex}-${courseIndex}-${assessmentIndex}`}
                    assessment={assessment}
                    programIndex={programIndex}
                    courseIndex={courseIndex}
                    assessmentIndex={assessmentIndex}
                  />
                ));

                assessmentCells.push(
                  <td
                    key={`assessment-total-${programIndex}-${courseIndex}`}
                    className="border border-coa-gray px-2 py-2 text-center font-semibold text-gray-600 min-w-[50px]"
                  >
                    Total
                  </td>,
                  <td
                    key={`assessment-pass70-${programIndex}-${courseIndex}`}
                    className="border border-coa-gray px-2 py-2 text-center text-sm min-w-[56px]"
                  >
                    Passing (70%)
                  </td>,
                  <td
                    key={`assessment-pass80-${programIndex}-${courseIndex}`}
                    className="border border-coa-gray px-2 py-2 text-center text-sm min-w-[56px]"
                  >
                    Passing (80%)
                  </td>
                );

                return assessmentCells;
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
              return layout.flatMap((po, programIndex) =>
                po.cos.flatMap((co, courseIndex) => {
                  const { totalMax, pass70, pass80Count } = coTotalsMemo[index++];

                  const maxCells = co.clustered.map((assessment, assessmentIndex) => {
                    const maxVal = co.assessments[assessment.coIndex]?.maxScore ?? "";
                    return (
                      <td
                        key={`max-${programIndex}-${courseIndex}-${assessmentIndex}`}
                        className="border border-coa-gray px-3 py-2 text-center text-coa-blue min-w-[56px] "
                      >
                        {maxVal}
                      </td>
                    );
                  });

                  maxCells.push(
                    <td
                      key={`max-total-${programIndex}-${courseIndex}`}
                      className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                    >
                      {totalMax}
                    </td>,
                    <td
                      key={`max-pass70-${programIndex}-${courseIndex}`}
                      className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                    >
                      {pass70}
                    </td>,
                    <td
                      key={`max-pass80-${programIndex}-${courseIndex}`}
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
                {student.lName}, {student.fName}
              </td>

              {(() => {
                let index = 0;
                return layout.flatMap((po, programIndex) =>
                  po.cos.flatMap((co, courseIndex) => {
                    const studentScores = student.scores[co.title] ?? [];
                    const { pass70: pass70Threshold, pass80Count } = coTotalsMemo[index++];

                    const scoreCells = co.clustered.map((assessment, assessmentIndex) => {
                      const val = studentScores[assessment.coIndex] ?? "";
                      return (
                        <StudentScoreCell
                          key={`score-${student.id}-${programIndex}-${courseIndex}-${assessmentIndex}`}
                          val={val}
                          studentId={student.id}
                          programIndex={programIndex}
                          courseIndex={courseIndex}
                          assessmentIndex={assessmentIndex}
                        />
                      );
                    });

                    if (studentScores.length > 0) {
                      // Calculate student total score
                      const studentTotal = studentScores.reduce(
                        (sum, sc) => sum + (sc ?? 0),
                        0
                      );
                      const pass70 = studentTotal >= pass70Threshold;

                      // Count students who passed 70% threshold
                      const pass70Count = students.filter((s) => {
                        const total = (s.scores[co.title] ?? []).reduce(
                          (sum, sc) => sum + (sc ?? 0),
                          0
                        );
                        return total >= pass70Threshold;
                      }).length;
                      const pass80 = pass70Count >= pass80Count;

                      scoreCells.push(
                        <td
                          key={`student-total-${student.id}-${programIndex}-${courseIndex}`}
                          className="border border-coa-gray px-3 py-2 text-center font-semibold text-coa-blue"
                        >
                          {studentTotal}
                        </td>,
                        <td
                          key={`student-pass70-${student.id}-${programIndex}-${courseIndex}`}
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
                            key={`student-pass80-${programIndex}-${courseIndex}`}
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
                          key={`student-total-${student.id}-${programIndex}-${courseIndex}`}
                          className="border border-coa-gray px-3 py-2 text-center"
                        />,
                        <td
                          key={`student-pass70-${student.id}-${programIndex}-${courseIndex}`}
                          className="border border-coa-gray px-3 py-2 text-center"
                        />,
                        ...(sIdx === 0
                          ? [
                            <td
                              key={`student-pass80-${programIndex}-${courseIndex}`}
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
  );
}