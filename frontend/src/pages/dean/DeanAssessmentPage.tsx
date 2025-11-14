import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";

export default function DeanAssessmentPage() {
  const { department_id } = useParams();
  return (
    <AppLayout activeItem={`/college/${department_id}`}>
      <div>Assessment Page</div>
    </AppLayout>
  );
}
