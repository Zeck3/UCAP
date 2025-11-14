import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import AssessmentPageComponent from "../../components/AssessmentPageComponent";

export default function CampusAssessmentPage() {
  const { department_id, section_id } = useParams();
  return (
    <AppLayout activeItem={`/campus/${department_id}`}>
      <AssessmentPageComponent sectionId={Number(section_id)}/>
    </AppLayout>
  );
}