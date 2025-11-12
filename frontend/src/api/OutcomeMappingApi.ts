import type { MappingCell, OutcomeMappingResponse } from "../types/outcomeMappingTypes";
import axiosClient from "./axiosClient";

export const getOutcomeMappings = async (
  loadedCourseId: number
): Promise<OutcomeMappingResponse> => {
  const response = await axiosClient.get(
    `/instructor/outcome_mapping_management/${loadedCourseId}/`
  );
  return response.data;
};

export const updateOutcomeMapping = async (
  mappingId: number,
  outcomeMapping: string
): Promise<MappingCell> => {
  const response = await axiosClient.put(
    `/instructor/outcome_mapping_management/update/${mappingId}/`,
    { outcome_mapping: outcomeMapping }
  );
  return response.data;
};
