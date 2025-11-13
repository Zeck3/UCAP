import axiosClient from "./axiosClient";
import type { OutcomeMappingResponse } from "../types/outcomeMappingTypes";

export const getOutcomeMappingML = async (
  loadedCourseId: number
): Promise<OutcomeMappingResponse> => {
  const response = await axiosClient.get(
    `/instructor/outcome_mapping_ml/${loadedCourseId}/`
  );
  return response.data;
};