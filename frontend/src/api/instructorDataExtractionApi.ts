import axiosClient from "./axiosClient";

export interface COPOResult {
  CO: string;
  Description: string;
  Mapped_POs: string[];
}

/**
 * Upload syllabus PDF and extract CO–PO mapping.
 *
 * @param loadedCourseId 
 * @param file
 */
export async function extractSyllabus(
  loadedCourseId: number,
  file: File
): Promise<COPOResult[]> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosClient.post<COPOResult[]>(
    `/instructor/${loadedCourseId}/extract-syllabus/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}