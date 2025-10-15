import AppLayout from "../../layout/AppLayout";
import ClassRecordComponent from "../../components/classrecord/ClassRecordComponent";
import { useNavigate, useParams } from "react-router-dom";
import ActionBarComponent from "../../components/ActionBarComponent";

export default function ClassRecordPage() {
  const navigate = useNavigate();
  const { loaded_course_id, course_code, section_id, year_and_section } = useParams();

  const goToAssessmentPage = () => {
    navigate(
      `/instructor/${loaded_course_id}/${course_code}/${section_id}/${year_and_section}/assessment`
    );
  };
  return (
    <AppLayout activeItem="/instructor" disablePadding>
      <ClassRecordComponent />
      <ActionBarComponent goToAssessmentPage={goToAssessmentPage} />
    </AppLayout>
  );
}
