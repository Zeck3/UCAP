import axiosClient from "./axiosClient";
import type {
  AssessmentPageData,
  ClassInfo,
  CourseOutcome,
  ProgramOutcome,
  Student,
} from "../types/assessmentPageTypes";

/* -------------------------------------------------------
   Utility Type Guards
------------------------------------------------------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

function getFirstKey(v: unknown): string | null {
  if (!isRecord(v)) return null;
  const keys = Object.keys(v);
  return keys.length > 0 ? keys[0] : null;
}

function buildClassInfo(info: Record<string, unknown>): ClassInfo {
  return {
    cacode: String(info.university_hierarchy ?? ""),
    program: String(info.program_name ?? ""),
    course: String(info.course_title ?? ""),
    aySemester: String(info.academic_year_and_semester_type ?? ""),
    faculty: String(info.instructor_assigned ?? ""),
  };
}

interface RawClassworkEntry {
  assessment_id?: unknown;
  assessment_title?: unknown;
  assessment_highest_score?: unknown;
}

interface ParsedClasswork {
  classwork: Array<{ name: string; blooms: string[]; maxScore: number }>;
  assessmentIds: number[];
}

function parseBloomsClassification(items: unknown[]): ParsedClasswork {
  const classwork: ParsedClasswork["classwork"] = [];
  const assessmentIds: number[] = [];

  for (const bc of items) {
    if (!isRecord(bc)) continue;

    for (const bloomsKey of Object.keys(bc)) {
      const entryList = asArray<RawClassworkEntry>(bc[bloomsKey]);

      for (const entry of entryList) {
        const id = Number(entry.assessment_id);
        const title =
          typeof entry.assessment_title === "string"
            ? entry.assessment_title.trim()
            : "";

        const maxScoreNum = Number(entry.assessment_highest_score ?? 0);

        const blooms = bloomsKey
          .split("/")
          .map((v) => v.trim())
          .filter(Boolean);

        classwork.push({
          name: title,
          blooms,
          maxScore: Number.isFinite(maxScoreNum) ? maxScoreNum : 0,
        });

        if (Number.isFinite(id)) assessmentIds.push(id);
      }
    }
  }

  return { classwork, assessmentIds };
}

function processCourseOutcomeSections(
  sections: unknown[],
  cos: CourseOutcome[],
  coToAssessmentIds: Map<string, number[]>
): void {
  for (const sec of sections) {
    if (!isRecord(sec)) continue;

    const coName = getFirstKey(sec);
    if (!coName) continue;

    const entryList = asArray<unknown>(sec[coName]);

    const combinedClasswork: CourseOutcome["classwork"] = [];
    const combinedIds: number[] = [];

    for (const entry of entryList) {
      if (!isRecord(entry)) continue;

      const bloomsArr = asArray<unknown>(entry.blooms_classification);
      const parsed = parseBloomsClassification(bloomsArr);

      combinedClasswork.push(...parsed.classwork);
      combinedIds.push(...parsed.assessmentIds);
    }

    if (combinedClasswork.length > 0) {
      cos.push({ name: coName, classwork: combinedClasswork });
      coToAssessmentIds.set(coName, combinedIds);
    }
  }
}

function processCourseOutcomes(
  rawCo: unknown[],
  cos: CourseOutcome[],
  coMap: Map<string, number[]>
): void {
  for (const obj of rawCo) {
    if (!isRecord(obj)) continue;

    const coName = getFirstKey(obj);
    if (!coName) continue;

    const sections = asArray<unknown>(obj[coName]);
    processCourseOutcomeSections(sections, cos, coMap);
  }
}

function processProgramOutcomes(
  rawPos: unknown[],
  pos: ProgramOutcome[],
  coMap: Map<string, number[]>
): void {
  for (const obj of rawPos) {
    if (!isRecord(obj)) continue;

    const poName = getFirstKey(obj);
    if (!poName) continue;

    const container = obj[poName];
    const coContainers = asArray<unknown>(container);

    const cos: CourseOutcome[] = [];

    for (const coContainer of coContainers) {
      if (!isRecord(coContainer)) continue;

      const rawCOs = asArray<unknown>(coContainer.course_outcomes);
      processCourseOutcomes(rawCOs, cos, coMap);
    }

    if (cos.length > 0) pos.push({ name: poName, cos });
  }
}


interface RawScore {
  assessment_id?: unknown;
  value?: unknown;
}

function buildScoreMap(raw: RawScore[]): Map<number, number | null> {
  const map = new Map<number, number | null>();

  for (const sc of raw) {
    const id = Number(sc.assessment_id);
    const val = Number.isFinite(sc.value) ? (sc.value as number) : null;

    if (Number.isFinite(id)) {
      map.set(id, val);
    }
  }

  return map;
}

function transformStudents(
  rawStudents: unknown[],
  coMap: Map<string, number[]>
): Student[] {
  return rawStudents
    .filter(isRecord)
    .map((student) => {
      const rawScores = asArray<RawScore>(student.scores);
      const scoreMap = buildScoreMap(rawScores);

      const scores: Student["scores"] = {};

      for (const [coName, ids] of coMap.entries()) {
        scores[coName] = ids.map((id) => ({ raw: scoreMap.get(id) ?? null }));
      }

      return {
        id: String(student.id_number ?? student.student_id ?? ""),
        name: String(student.student_name ?? ""),
        scores,
      };
    });
}

function transformAssessmentResponse(resp: unknown): AssessmentPageData {
  const root = isRecord(resp) ? resp : {};

  const info = isRecord(root.info) ? root.info : {};
  const classInfo = buildClassInfo(info);

  const pos: ProgramOutcome[] = [];
  const coToAssessmentIds = new Map<string, number[]>();

  const assessments = asArray<unknown>(root.assessments);

  for (const block of assessments) {
    if (!isRecord(block)) continue;

    const programOutcomes = asArray<unknown>(block.program_outcomes);
    processProgramOutcomes(programOutcomes, pos, coToAssessmentIds);
  }

  const students = transformStudents(asArray(root.students), coToAssessmentIds);

  return { classInfo, pos, students };
}

export async function getAssessmentPageData(
  sectionId: number
): Promise<AssessmentPageData> {
  const res = await axiosClient.get(`/assessments/${sectionId}/`);
  return transformAssessmentResponse(res.data);
}
