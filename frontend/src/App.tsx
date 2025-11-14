import { Routes, Route, Navigate } from "react-router-dom";
import { Roles } from "./config/Roles";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/ErrorPage";
import CourseDashboard from "./pages/instructor/CourseDashboard";
import CoursePage from "./pages/instructor/CoursePage";
import ClassRecordPage from "./pages/instructor/ClassRecordPage";
import AdminCourseDashboard from "./pages/admin/AdminCourseDashboard";
import AdminUserDashboard from "./pages/admin/AdminUserDashboard";
import DepartmentChairCourseDashboard from "./pages/department_chair/DepartmentChairCourseDashboard";
import DepartmentChairCoursePage from "./pages/department_chair/DepartmentChairCoursePage";
import DepartmentChairAssessmentPage from "./pages/department_chair/DepartmentChairAssessmentPage";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { useHeartbeat } from "./context/useHeartbeat";
import DeanCourseDashboard from "./pages/dean/DeanCourseDashboard";
import DeanAssessmentPage from "./pages/dean/DeanAssessmentPage";
import DeanCoursePage from "./pages/dean/DeanCoursePage";
import CampusCourseDashboard from "./pages/vpaaAndVpaa/CampusCourseDashboard";
import CampusCoursePage from "./pages/vpaaAndVpaa/CampusCoursePage";
import CampusAssessmentPage from "./pages/vpaaAndVpaa/CampusAssessmentPage";
import AssessmentPage from "./pages/instructor/AssessmentPage";

export default function App() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext is undefined");
  const { user } = auth;
  useHeartbeat(user, 1000);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              Roles.ViceChancellorOfAcademicAffairs,
              Roles.VicePresidentOfAcademicAffairs,
            ]}
          />
        }
      >
        <Route
          path="/campus/:department_id/:loaded_course_id/:section_id"
          element={<CampusAssessmentPage />}
        />
        <Route
          path="/campus/:department_id/:loaded_course_id"
          element={<CampusCoursePage />}
        />
        <Route
          path="/campus/:department_id"
          element={<CampusCourseDashboard />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.Dean]} />}>
        <Route
          path="/college/:department_id/:loaded_course_id/:section_id"
          element={<DeanAssessmentPage />}
        />
        <Route
          path="/college/:department_id/:loaded_course_id"
          element={<DeanCoursePage />}
        />
        <Route
          path="/college/:department_id"
          element={<DeanCourseDashboard />}
        />
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={[Roles.DepartmentChair]} />}
      >
        <Route
          path="/department/:department_id/:loaded_course_id/:section_id"
          element={<DepartmentChairAssessmentPage />}
        />
        <Route
          path="/department/:department_id/:loaded_course_id"
          element={<DepartmentChairCoursePage />}
        />
        <Route
          path="/department/:department_id"
          element={<DepartmentChairCourseDashboard />}
        />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.Instructor]} />}>
        <Route
          path="/instructor/:loaded_course_id/:section_id/assessment"
          element={<AssessmentPage />}
        />
        <Route
          path="/instructor/:loaded_course_id/:section_id"
          element={<ClassRecordPage />}
        />
        <Route path="/instructor/:loaded_course_id" element={<CoursePage />} />
        <Route path="/instructor" element={<CourseDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[Roles.Administrator]} />}>
        <Route
          path="/admin/course_management"
          element={<AdminCourseDashboard />}
        />
        <Route path="/admin/user_management" element={<AdminUserDashboard />} />
      </Route>
    </Routes>
  );
}
