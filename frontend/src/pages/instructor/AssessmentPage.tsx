import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import AssessmentPageComponent from "../../components/AssessmentPageComponent";

export default function AssessmentPage() {
  const { section_id } = useParams();
  return (
    <AppLayout activeItem={`/instructor`} disablePadding>
      <AssessmentPageComponent sectionId={Number(section_id)}/>
    </AppLayout>
  );
}