import axiosClient from "./axiosClient";
import type { AssessmentPageData } from "../types/assessmentPageTypes";

function asArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}

function getFirstKey(obj: any): string | null {
  if (!obj) return null;
  const keys = Object.keys(obj);
  return keys.length > 0 ? keys[0] : null;
}

function buildClassInfo(info: any) {
  return {
    cacode: String(info.university_hierarchy ?? ""),
    program: String(info.program_name ?? ""),
    course: String(info.course_title ?? ""),
    aySemester: String(info.academic_year_and_semester_type ?? ""),
    faculty: String(info.instructor_assigned ?? ""),
  };
}

function parseBloomsClassification(
  bloomsArr: any[],
  secKey: string
): { classwork: Array<{ name: string; blooms: string[]; maxScore: number }>; assessmentIds: number[] } {
  const classwork: Array<{ name: string; blooms: string[]; maxScore: number }> = [];
  const assessmentIds: number[] = [];

  for (const bc of bloomsArr) {
    if (!bc) continue;
    
    for (const bloomGroup of Object.keys(bc)) {
      const entries = asArray<any>(bc[bloomGroup]);
      
      for (const entry of entries as any[]) {
        const assessmentId = Number(entry?.assessment_id);
        const title = entry?.assessment_title as string | null | undefined;
        const highest = Number(entry?.assessment_highest_score ?? 0);
        const blooms = String(bloomGroup)
          .split("/")
          .map((s) => s.trim())
          .filter(Boolean);

        const name = title?.trim() ? title : `${secKey} - ${bloomGroup}`;

        classwork.push({ 
          name, 
          blooms, 
          maxScore: isFinite(highest) ? highest : 0 
        });
        
        if (Number.isFinite(assessmentId)) {
          assessmentIds.push(assessmentId);
        }
      }
    }
  }

  return { classwork, assessmentIds };
}

function processCourseOutcomeSections(
  coSections: any[],
  cos: AssessmentPageData["pos"][0]["cos"],
  coToAssessmentIds: Map<string, number[]>
): void {
  for (const sectionObj of coSections as any[]) {
    const secKey = getFirstKey(sectionObj);
    if (!secKey) continue;

    const secArr = asArray<any>(sectionObj[secKey]);
    const allClasswork: Array<{ name: string; blooms: string[]; maxScore: number }> = [];
    const allAssessmentIds: number[] = [];

    for (const secItem of secArr as any[]) {
      const bloomsArr = asArray<any>(secItem?.blooms_classification);
      const { classwork, assessmentIds } = parseBloomsClassification(bloomsArr, secKey);
      
      allClasswork.push(...classwork);
      allAssessmentIds.push(...assessmentIds);
    }

    if (allClasswork.length > 0) {
      cos.push({ name: secKey, classwork: allClasswork });
      coToAssessmentIds.set(secKey, allAssessmentIds);
    }
  }
}

function processCourseOutcomes(
  courseOutcomesArr: any[],
  cos: AssessmentPageData["pos"][0]["cos"],
  coToAssessmentIds: Map<string, number[]>
): void {
  for (const coObj of courseOutcomesArr as any[]) {
    const coName = getFirstKey(coObj);
    if (!coName) continue;

    const coSections = asArray<any>(coObj[coName]);
    processCourseOutcomeSections(coSections, cos, coToAssessmentIds);
  }
}

function processProgramOutcomes(
  programOutcomes: any[],
  pos: AssessmentPageData["pos"],
  coToAssessmentIds: Map<string, number[]>
): void {
  for (const poObj of programOutcomes as any[]) {
    const poName = getFirstKey(poObj);
    if (!poName) continue;

    const poVal = poObj[poName];
    const coContainerArr = asArray<any>(poVal);
    const cos: AssessmentPageData["pos"][0]["cos"] = [];

    for (const coContainer of coContainerArr as any[]) {
      const courseOutcomesArr = asArray<any>(coContainer?.course_outcomes);
      processCourseOutcomes(courseOutcomesArr, cos, coToAssessmentIds);
    }

    if (cos.length > 0) {
      pos.push({ name: poName, cos });
    }
  }
}

function buildScoreMap(scoreList: any[]): Map<number, number | null> {
  const scoreMap = new Map<number, number | null>();
  
  for (const item of scoreList) {
    const id = Number(item?.assessment_id);
    const val = item?.value;
    
    if (Number.isFinite(id)) {
      scoreMap.set(id, typeof val === "number" ? val : null);
    }
  }
  
  return scoreMap;
}

function transformStudents(
  studentsSrc: any[],
  coToAssessmentIds: Map<string, number[]>
): AssessmentPageData["students"] {
  return studentsSrc.map((s: any) => {
    const scoreList = asArray<any>(s?.scores);
    const scoreMap = buildScoreMap(scoreList);

    const scores: Record<string, { raw: number | null }[]> = {};
    for (const [coName, idList] of coToAssessmentIds.entries()) {
      scores[coName] = idList.map((id) => ({ raw: scoreMap.get(id) ?? null }));
    }

    return {
      id: String(s?.id_number ?? s?.student_id ?? ""),
      name: String(s?.student_name ?? ""),
      scores,
    };
  });
}

function transformAssessmentResponse(resp: any): AssessmentPageData {
  const info = resp?.info ?? {};
  const classInfo = buildClassInfo(info);
  
  const coToAssessmentIds = new Map<string, number[]>();
  const pos: AssessmentPageData["pos"] = [];
  const assessments = asArray<any>(resp?.assessments);

  for (const assessmentBlock of assessments as any[]) {
    const programOutcomes = asArray<any>(assessmentBlock?.program_outcomes);
    processProgramOutcomes(programOutcomes, pos, coToAssessmentIds);
  }

  const studentsSrc = asArray<any>(resp?.students);
  const students = transformStudents(studentsSrc, coToAssessmentIds);

  return { classInfo, pos, students };
}

export const getAssessmentPageData = async (
  section_id: number
): Promise<AssessmentPageData> => {
  try {
    const response = await axiosClient.get(`/assessments/${section_id}/`);
    const raw = response.data;
    return transformAssessmentResponse(raw);
  } catch (error) {
    console.error("Error fetching assessment page data:", error);
    throw error;
  }
};