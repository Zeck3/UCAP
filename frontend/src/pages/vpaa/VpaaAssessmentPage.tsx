import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import AssessmentPageComponent from "../../components/AssessmentPageComponent";

export default function VpaaAssessmentPage() {
  const { section_id } = useParams();

  return (
    <AppLayout activeItem="/university" disablePadding>
      <AssessmentPageComponent sectionId={Number(section_id)} />
    </AppLayout>
  );
}