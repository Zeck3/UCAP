import axios from "./axiosClient";

export async function importStudentsCSV(
  sectionId: number,
  file: File,
  mode: "append" | "override"
) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `/instructor/students/import/?section=${sectionId}&mode=${mode}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}
