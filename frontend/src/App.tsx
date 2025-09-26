import { Routes, Route, Navigate } from "react-router-dom";
import { Roles } from "./config/Roles";
import ProtectedRoute from "./components/routes/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import CourseDashboard from "./pages/instructor/CourseDashboard";
import CoursePage from "./pages/instructor/CoursePage";
import ClassRecordPage from "./pages/instructor/ClassRecordPage";
import AdminCourseDashboard from "./pages/admin/AdminCourseDashboard";
import AdminUserDashboard from "./pages/admin/AdminUserDashboard";
import DepartmentChairCourseDashboard from "./pages/department_chair/DepartmentChairCourseDashboard";
import DepartmentChairCoursePage from "./pages/department_chair/DepartmentChairCoursePage";
import DepartmentChairAssessmentPage from "./pages/department_chair/DepartmentChairAssessmentPage";
import { useIdleHeartbeat } from "./context/useIdleHeartbeat";

export default function App() {
  useIdleHeartbeat();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />

      <Route element={<ProtectedRoute allowedRoles={[Roles.DepartmentChair]} />}>
        <Route path="/department/:department_name/:loaded_course_id/:course_code/:year_and_section" element={<DepartmentChairAssessmentPage />} />
        <Route path="/department/:department_name/:loaded_course_id/:course_code" element={<DepartmentChairCoursePage />} />
        <Route path="/department/:department_name" element={<DepartmentChairCourseDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.Instructor]} />}>
        <Route path="/instructor/:loaded_course_id/:course_code/:year_and_section" element={<ClassRecordPage />} />
        <Route path="/instructor/:loaded_course_id/:course_code" element={<CoursePage />} />
        <Route path="/instructor" element={<CourseDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.Administrator]} />}>
        <Route path="/admin/course_management" element={<AdminCourseDashboard />} />
        <Route path="/admin/user_management" element={<AdminUserDashboard />} />
      </Route>
    </Routes>
  );
}
