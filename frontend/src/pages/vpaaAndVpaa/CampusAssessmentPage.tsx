import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";

export default function CampusAssessmentPage() {
  const { department_id } = useParams();
  return (
    <AppLayout activeItem={`/campus/${department_id}`}>
      <div>Assessment Page</div>
    </AppLayout>
  );
}
