import React, { useEffect, useMemo } from "react";
import type { DepartmentCourses } from "../types/departmentChairLoadedCourseTypes";

interface DepartmentCoursesTableProps {
  courses: DepartmentCourses[];
  onSelectionChange: (selected: string[]) => void;
  selectedCourses: string[];
  loading?: boolean;
  error?: string;
  onClearError?: (name: string) => void;
}

const YEAR_WORDS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
};

function yearSortKey(year?: string | null) {
  if (!year) return 999;

  const y = year.toLowerCase();

  const numMatch = y.match(/\d+/);
  if (numMatch) return Number(numMatch[0]);

  for (const [word, n] of Object.entries(YEAR_WORDS)) {
    if (y.includes(word)) return n;
  }

  return 999;
}

function semSortKey(sem?: string | null) {
  if (!sem) return 999;
  const s = sem.toLowerCase();

  if (s.includes("1st") || s.includes("first") || s.includes("1")) return 1;
  if (s.includes("2nd") || s.includes("second") || s.includes("2")) return 2;
  if (s.includes("midyear") || s.includes("mid-year") || s.includes("mid"))
    return 3;

  return 999;
}

function hasKey<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return typeof obj === "object" && obj !== null && key in obj;
}

function getCreatedDate(c: DepartmentCourses): string | null {
  if (hasKey(c, "created_at") && typeof c.created_at === "string")
    return c.created_at;

  if (hasKey(c, "created_on") && typeof c.created_on === "string")
    return c.created_on;

  if (hasKey(c, "date_created") && typeof c.date_created === "string")
    return c.date_created;

  if (hasKey(c, "dateCreated") && typeof c.dateCreated === "string")
    return c.dateCreated;

  return null;
}

function courseCompare(a: DepartmentCourses, b: DepartmentCourses) {
  const aCreated = getCreatedDate(a);
  const bCreated = getCreatedDate(b);

  if (aCreated && bCreated) {
    const at = new Date(aCreated).getTime();
    const bt = new Date(bCreated).getTime();
    if (at !== bt) return at - bt;
  }

  return a.course_code.localeCompare(b.course_code, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}


export default function DepartmentCoursesTableComponent({
  courses,
  onSelectionChange,
  selectedCourses,
  loading = false,
  error,
  onClearError,
}: DepartmentCoursesTableProps) {
  useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => {
        onClearError("courses");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  const hasError = Boolean(error);

  const groupedList = useMemo(() => {
    if (!courses || courses.length === 0) return [];

    const groups: Record<string, Record<string, DepartmentCourses[]>> = {};

    courses.forEach((course) => {
      const year = course.year_level_type || "Unknown Year";
      const sem = course.semester_type || "Unknown Semester";
      if (!groups[year]) groups[year] = {};
      if (!groups[year][sem]) groups[year][sem] = [];
      groups[year][sem].push(course);
    });

    Object.keys(groups).forEach((year) => {
      Object.keys(groups[year]).forEach((sem) => {
        groups[year][sem].sort(courseCompare);
      });
    });

    return Object.keys(groups)
      .sort((a, b) => yearSortKey(a) - yearSortKey(b))
      .map((year) => ({
        year,
        semesters: Object.keys(groups[year])
          .sort((a, b) => semSortKey(a) - semSortKey(b))
          .map((sem) => ({
            sem,
            courses: groups[year][sem],
          })),
      }));
  }, [courses]);

  const toggleSelection = (code: string) => {
    if (loading) return;
    const updated = selectedCourses.includes(code)
      ? selectedCourses.filter((c) => c !== code)
      : [...selectedCourses, code];
    onSelectionChange(updated);
    if (onClearError) onClearError("courses");
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="text-sm py-2">
          Program Curriculum Courses<span className="text-red-500 ml-1">*</span>
        </div>

        <div className="overflow-x-auto w-full border border-[#E9E6E6] rounded-md">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                <th className="w-12"></th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-[#E9E6E6]">
                  <td className="px-2 py-3">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-10 mx-auto bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-10 mx-auto bg-gray-200 rounded animate-pulse" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-10 mx-auto bg-gray-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-5 py-2" />
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col">
        <span className="text-sm py-2">
          Program Curriculum Courses<span className="text-red-500 ml-1">*</span>
        </span>
        <div className="text-center text-gray-500 py-16 border border-[#E9E6E6] rounded-md">
          No department courses available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm py-2">
        Program Curriculum Courses<span className="text-red-500 ml-1">*</span>
      </span>
      <div
        className={`
          overflow-x-auto w-full rounded-md border transition-colors
          ${hasError ? "border-red-500" : "border-[#E9E6E6]"}
          ${loading ? "opacity-50 cursor-not-allowed select-none" : ""}
        `}
      >
        <table className="min-w-full text-sm text-left border-collapse">
          <thead>
            <tr>
              <th className="w-12"></th>
              <th className="px-4 py-3 font-medium">Course Code</th>
              <th className="px-4 py-3 font-medium">Course Title</th>
              <th className="px-4 py-3 font-medium">Lec</th>
              <th className="px-4 py-3 font-medium">Lab</th>
              <th className="px-4 py-3 font-medium">Credit</th>
            </tr>
          </thead>
          <tbody>
            {groupedList.map(({ year, semesters }) =>
              semesters.map(({ sem, courses: semCourses }) => {
                const totals = semCourses.reduce(
                  (acc, c) => ({
                    lec: acc.lec + Number(c.lecture_unit || 0),
                    lab: acc.lab + Number(c.laboratory_unit || 0),
                    credit: acc.credit + Number(c.credit_unit || 0),
                  }),
                  { lec: 0, lab: 0, credit: 0 }
                );

                return (
                  <React.Fragment key={`${year}-${sem}`}>
                    <tr className="border-t border-[#E9E6E6] bg-gray-50">
                      <td className="px-2 py-3 text-center">
                        <input
                          type="checkbox"
                          id={`bulk-${year}-${sem}`}
                          name={`bulk-${year}-${sem}`}
                          disabled={loading}
                          onChange={(e) => {
                            if (loading) return;
                            const courseCodes = semCourses.map(
                              (c) => c.course_code
                            );
                            if (e.target.checked) {
                              onSelectionChange([
                                ...new Set([
                                  ...selectedCourses,
                                  ...courseCodes,
                                ]),
                              ]);
                            } else {
                              onSelectionChange(
                                selectedCourses.filter(
                                  (code) => !courseCodes.includes(code)
                                )
                              );
                            }
                            if (onClearError) onClearError("courses");
                          }}
                          checked={semCourses.every((c) =>
                            selectedCourses.includes(c.course_code)
                          )}
                        />
                      </td>
                      <td colSpan={5} className="px-4 py-3">
                        {year} - {sem}
                      </td>
                    </tr>

                    {semCourses.map((c) => (
                      <tr
                        key={c.course_code}
                        className="border-t border-[#E9E6E6]"
                      >
                        <td className="px-2 py-3 text-center">
                          <input
                            type="checkbox"
                            id={`course-${c.course_code}`}
                            name="department_course"
                            disabled={loading}
                            checked={selectedCourses.includes(c.course_code)}
                            onChange={() => toggleSelection(c.course_code)}
                          />
                        </td>
                        <td className="px-4 py-3">{c.course_code}</td>
                        <td className="px-4 py-3">{c.course_title}</td>
                        <td className="px-4 py-3 text-center">
                          {Number(c.lecture_unit).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {Number(c.laboratory_unit).toFixed(1)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {Number(c.credit_unit).toFixed(1)}
                        </td>
                      </tr>
                    ))}

                    <tr className="border-t border-[#E9E6E6]">
                      <td colSpan={3}></td>
                      <td className="px-4 py-3 text-center font-medium">
                        {Math.round(totals.lec)}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {Math.round(totals.lab)}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {Math.round(totals.credit)}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="h-5 py-2">
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
