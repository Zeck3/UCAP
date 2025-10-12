import axiosClient from "./axiosClient";

export const getAssessmentPageData = async (section_id: number) => {
  try {
    const response = await axiosClient.get(
      `/assessments/${section_id}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assessment page data:", error);
    throw error;
  }
};