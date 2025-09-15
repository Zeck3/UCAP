import { useState } from "react";
import AppLayout from "../../layout/AppLayout";
import ClassRecordTable from "../../components/ClassRecordTable";

interface Student {
  id: string;
  name: string;
  scores: (number | undefined)[];
  finalScores: (number | "")[];
  finalCompGrades: (number | undefined)[];
}

export default function ClassRecordPage() {

  const [students, setStudents] = useState<Student[]>([
    {
      id: "2025000000",
      name: "Jane Doe",
      scores: Array(22).fill(undefined),
      finalScores: Array(22).fill(""),
      finalCompGrades: Array(22).fill(undefined),
    },
  ]);

  const handleScoreChange = (
    studentIndex: number,
    scoreIndex: number,
    value: string
  ) => {
    const updatedStudents = [...students];
    const parsed = parseFloat(value);
    updatedStudents[studentIndex].scores[scoreIndex] =
      value === "" ? undefined : isNaN(parsed) ? 0 : parsed;
    setStudents(updatedStudents);
  };

  const handleFinalScoreChange = (
    studentIndex: number,
    scoreIndex: number,
    value: string
  ) => {
    const updatedStudents = [...students];
    const parsed = parseFloat(value);
    updatedStudents[studentIndex].finalScores[scoreIndex] =
      value === "" ? "" : isNaN(parsed) ? 0 : parsed;
    setStudents(updatedStudents);
  };

  const handleFinalCompGradeChange = (
    studentIndex: number,
    gradeIndex: number,
    value: string
  ) => {
    const updatedStudents = [...students];
    const parsed = parseFloat(value);
    updatedStudents[studentIndex].finalCompGrades[gradeIndex] =
      value === "" ? undefined : isNaN(parsed) ? 0 : parsed;
    setStudents(updatedStudents);
  };


  return (
    <AppLayout activeItem="/instructor" disablePadding>
      <ClassRecordTable
        students={students}
        handleScoreChange={handleScoreChange}
        handleFinalScoreChange={handleFinalScoreChange}
        handleFinalCompGradeChange={handleFinalCompGradeChange}
      />
    </AppLayout>
  );
}
