import axiosClient from "./axiosClient";

export interface COPOResult {
  CO: string;
  Description: string;
  Mapped_POs: string[];
}

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

  const data = res.data;

  console.log("Syllabus extraction result:", data);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No CO–PO data extracted from the uploaded PDF.");
  }

  return data;
}
