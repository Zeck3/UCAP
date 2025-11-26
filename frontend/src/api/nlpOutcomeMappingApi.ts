import axiosClient from "./axiosClient";
import type { OutcomeMappingResponse } from "../types/outcomeMappingTypes";

type RawNlpResult = Record<string, Record<string, number>>;
type NlpErrorPayload = { message?: string; detail?: string };

export async function fetchNlpOutcomeMapping(
  loadedCourseId: number,
  courseOutcomes: OutcomeMappingResponse["course_outcomes"],
  programOutcomes: OutcomeMappingResponse["program_outcomes"]
): Promise<OutcomeMappingResponse> {
  const res = await axiosClient.get<RawNlpResult | NlpErrorPayload>(
    `/instructor/nlp_outcome_mapping/${loadedCourseId}/`
  );

  const data = res.data;

  if (!data || typeof data !== "object") {
    throw new Error("Unexpected NLP response shape.");
  }

  if ("message" in data || "detail" in data) {
    const err = data as NlpErrorPayload;
    throw new Error(
      err.message ?? err.detail ?? "NLP endpoint returned an error."
    );
  }

  const raw = data as RawNlpResult;

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
