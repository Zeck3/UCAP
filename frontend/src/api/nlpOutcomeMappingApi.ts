import axiosClient from "./axiosClient";
import type { OutcomeMappingResponse } from "../types/outcomeMappingTypes";

type RawNlpResult = Record<string, Record<string, number>>;

export async function fetchNlpOutcomeMapping(
  loadedCourseId: number,
  courseOutcomes: OutcomeMappingResponse["course_outcomes"],
  programOutcomes: OutcomeMappingResponse["program_outcomes"]
): Promise<OutcomeMappingResponse> {
  const res = await axiosClient.get<RawNlpResult>(
    `/instructor/nlp_outcome_mapping/${loadedCourseId}/`
  );

  const raw = res.data;

  const coByCode = new Map(
    courseOutcomes.map((co) => [co.course_outcome_code, co])
  );
  const poByCode = new Map(
    programOutcomes.map((po) => [po.program_outcome_code, po])
  );

  const mapping = Object.entries(raw).flatMap(([coCode, poMap]) => {
    const co = coByCode.get(coCode);
    if (!co) return [];

    return Object.entries(poMap)
      .map(([poCode, v]) => {
        const po = poByCode.get(poCode);
        if (!po) return null;

        return {
          id: Number(`${co.course_outcome_id}${po.program_outcome_id}`),
          course_outcome: co,
          program_outcome: po,
          outcome_mapping: v === 1 ? "1" : "0",
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  });

  return {
    course_outcomes: courseOutcomes,
    program_outcomes: programOutcomes,
    mapping,
  };
}
