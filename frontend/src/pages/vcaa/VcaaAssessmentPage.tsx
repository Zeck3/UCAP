import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import AssessmentPageComponent from "../../components/AssessmentPageComponent";

export default function VcaaAssessmentPage() {
  const { campus_id, section_id } = useParams();
  return (
    <AppLayout activeItem={`/campus/${campus_id}`} disablePadding>
      <AssessmentPageComponent sectionId={Number(section_id)}/>
    </AppLayout>
  );
}