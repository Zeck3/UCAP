import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import AssessmentPageComponent from "../../components/AssessmentPageComponent";

export default function DeanAssessmentPage() {
  const { college_id, section_id } = useParams();

  return (
    <AppLayout activeItem={`/college/${college_id}`} disablePadding>
      <AssessmentPageComponent sectionId={Number(section_id)} />
    </AppLayout>
  );
}
