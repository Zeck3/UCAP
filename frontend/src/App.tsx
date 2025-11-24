import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Roles } from "./config/Roles";
import { AuthContext } from "./context/AuthContext";
import { useHeartbeat } from "./context/useHeartbeat";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/ErrorPage";
import CourseDashboard from "./pages/instructor/CourseDashboard";
import CoursePage from "./pages/instructor/CoursePage";
import ClassRecordPage from "./pages/instructor/ClassRecordPage";
import AdminUserDashboard from "./pages/admin/AdminUserDashboard";
import DepartmentChairCourseDashboard from "./pages/department_chair/DepartmentChairCourseDashboard";
import DepartmentChairCoursePage from "./pages/department_chair/DepartmentChairCoursePage";
import DepartmentChairAssessmentPage from "./pages/department_chair/DepartmentChairAssessmentPage";
import DeanCourseDashboard from "./pages/dean/DeanCourseDashboard";
import DeanAssessmentPage from "./pages/dean/DeanAssessmentPage";
import DeanCoursePage from "./pages/dean/DeanCoursePage";
import AssessmentPage from "./pages/instructor/AssessmentPage";
import { toast, ToastContainer } from "react-toastify";
import AdminHierarchyManagementDashboard from "./pages/admin/AdminHierarchyManagementDashboard";
import DepartmentChairCourseManagement from "./pages/department_chair/DepartmentChairCourseManagement";
import VcaaAssessmentPage from "./pages/vcaa/VcaaAssessmentPage";
import VcaaCoursePage from "./pages/vcaa/VcaaCoursePage";
import VcaaCourseDashboard from "./pages/vcaa/VcaaCourseDashboard";
import VpaaAssessmentPage from "./pages/vpaa/VpaaAssessmentPage";
import VpaaCoursePage from "./pages/vpaa/VpaaCoursePage";
import VpaaCourseDashboard from "./pages/vpaa/VpaaCourseDashboard";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext is undefined");
  const { user } = auth;
  useHeartbeat(user, 1000);

  const location = useLocation();

  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);

  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        aria-label={"Notification"}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />

        <Route element={ <ProtectedRoute allowedRoles={[Roles.VicePresidentForAcademicAffairs]}/> }>
          <Route path="/university/:loaded_course_id/:section_id" element={<VpaaAssessmentPage />} />
          <Route path="/university/:loaded_course_id" element={<VpaaCoursePage />} />
          <Route path="/university/" element={<VpaaCourseDashboard />} />
        </Route>

        <Route element={ <ProtectedRoute allowedRoles={[Roles.ViceChancellorForAcademicAffairs]}/> }>
          <Route path="/campus/:department_id/:loaded_course_id/:section_id" element={<VcaaAssessmentPage />} />
          <Route path="/campus/:department_id/:loaded_course_id" element={<VcaaCoursePage />} />
          <Route path="/campus/:department_id" element={<VcaaCourseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Roles.Dean]} />}>
          <Route path="/college/:department_id/:loaded_course_id/:section_id" element={<DeanAssessmentPage />} />
          <Route path="/college/:department_id/:loaded_course_id" element={<DeanCoursePage />} />
          <Route path="/college/:department_id" element={<DeanCourseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Roles.DepartmentChair]} />} >
          <Route path="/department/course_management/:department_id" element={<DepartmentChairCourseManagement />} />
          <Route path="/department/:department_id/:loaded_course_id/:section_id" element={<DepartmentChairAssessmentPage />} />
          <Route path="/department/:department_id/:loaded_course_id" element={<DepartmentChairCoursePage />} />
          <Route path="/department/:department_id" element={<DepartmentChairCourseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Roles.Instructor]} />}>
          <Route path="/instructor/:loaded_course_id/:section_id/assessment" element={<AssessmentPage />} />
          <Route path="/instructor/:loaded_course_id/:section_id" element={<ClassRecordPage />} />
          <Route path="/instructor/:loaded_course_id" element={<CoursePage />} />
          <Route path="/instructor" element={<CourseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Roles.Administrator]} />} >
          <Route path="/admin/user_management" element={<AdminUserDashboard />} />
          <Route path="/admin/hierarchy_management" element={<AdminHierarchyManagementDashboard />} />
        </Route>
      </Routes>
    </>
  );
}
