import AppLayout from "../../layout/AppLayout";
import ClassRecordComponent from "../../components/classrecord/ClassRecordComponent";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import FloatingToolbar from "../../components/FloatingToolbarComponent";

export default function ClassRecordPage() {
  const navigate = useNavigate();
  const [canGenerateResultSheet, setCanGenerateResultSheet] = useState(false);
  const [hasExistingStudents, setHasExistingStudents] = useState(false);
  const { loaded_course_id, section_id } = useParams();
  const location = useLocation();

  const { course_code, year_and_section } = (location.state || {}) as {
    course_code?: string;
    year_and_section?: string;
  };

  const [crReady, setCrReady] = useState(false);
  const [refreshFn, setRefreshFn] = useState<(() => Promise<void>) | null>(
    null
  );
  const [exportDataFn, setExportDataFn] = useState<(() => {
    headerNodes: any[];
    students: any[];
    studentScores: Record<number, Record<string, number>>;
    maxScores: Record<string, number>;
    computedValues: Record<number, Record<string, number>>;
  }) | null>(null);

  const goToAssessmentPage = () => {
    navigate(`/instructor/${loaded_course_id}/${section_id}/assessment`, {
      state: { course_code, year_and_section },
    });
  };

  return (
    <AppLayout activeItem="/instructor" disablePadding>
      <ClassRecordComponent
        onInitialized={() => setCrReady(true)}
        onProvideFetchStudents={(fn) => setRefreshFn(() => fn)}
        onProvideExportData={(fn) => setExportDataFn(() => fn)}
        onCanGenerateResultSheetChange={setCanGenerateResultSheet}
        onExistingStudentsChange={setHasExistingStudents} 
      />

      {crReady && refreshFn && exportDataFn && (
        <FloatingToolbar
          sectionId={Number(section_id)}
          goToAssessmentPage={goToAssessmentPage}
          refreshStudents={refreshFn}
          getExportData={exportDataFn}
          canGenerateResultSheet={canGenerateResultSheet}
          hasExistingStudents={hasExistingStudents}
        />
      )}
    </AppLayout>
  );
}
