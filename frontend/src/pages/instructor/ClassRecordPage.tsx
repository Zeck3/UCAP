import AppLayout from "../../layout/AppLayout";
import ClassRecordComponent from "../../components/classrecord/ClassRecordComponent";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ActionBarComponent from "../../components/ActionBarComponent";
import { useState } from "react";

export default function ClassRecordPage() {
  const navigate = useNavigate();
  const { loaded_course_id, section_id } = useParams();
  const location = useLocation();

  const { course_code, year_and_section } = (location.state || {}) as {
    course_code?: string;
    year_and_section?: string;
  };

  const [crReady, setCrReady] = useState(false);

  const goToAssessmentPage = () => {
    navigate(`/instructor/${loaded_course_id}/${section_id}/assessment`, {
      state: { course_code, year_and_section },
    });
  };

  return (
    <AppLayout activeItem="/instructor" disablePadding>
      <ClassRecordComponent onInitialized={() => setCrReady(true)} />

      {crReady && (
        <ActionBarComponent goToAssessmentPage={goToAssessmentPage} />
      )}
    </AppLayout>
  );
}