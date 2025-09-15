import { useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";

export default function ClassRecordPage() {
  const { department_name } = useParams();
  return (
    <AppLayout activeItem={`/department/${department_name}`}>
      <div>Assessment page</div>
    </AppLayout>
  );
}
