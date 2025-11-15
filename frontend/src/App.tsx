import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import { Roles } from "./config/Roles";
import { AuthContext } from "./context/AuthContext";
import { useHeartbeat } from "./context/useHeartbeat";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import PageLoading from "./pages/PageLoading";
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/ErrorPage"));
const CourseDashboard = lazy(() => import("./pages/instructor/CourseDashboard"));
const CoursePage = lazy(() => import("./pages/instructor/CoursePage"));
const ClassRecordPage = lazy(() => import("./pages/instructor/ClassRecordPage"));
const AssessmentPage = lazy(() => import("./pages/instructor/AssessmentPage"));
const AdminCourseDashboard = lazy(() => import("./pages/admin/AdminCourseDashboard"));
const AdminUserDashboard = lazy(() => import("./pages/admin/AdminUserDashboard"));
const DepartmentChairCourseDashboard = lazy(() => import("./pages/department_chair/DepartmentChairCourseDashboard"));
const DepartmentChairCoursePage = lazy(() => import("./pages/department_chair/DepartmentChairCoursePage"));
const DepartmentChairAssessmentPage = lazy(() => import("./pages/department_chair/DepartmentChairAssessmentPage"));
const DeanCourseDashboard = lazy(() => import("./pages/dean/DeanCourseDashboard"));
const DeanCoursePage = lazy(() => import("./pages/dean/DeanCoursePage"));
const DeanAssessmentPage = lazy(() => import("./pages/dean/DeanAssessmentPage"));
const CampusCourseDashboard = lazy(() => import("./pages/vpaaAndVpaa/CampusCourseDashboard"));
const CampusCoursePage = lazy(() => import("./pages/vpaaAndVpaa/CampusCoursePage"));
const CampusAssessmentPage = lazy(() => import("./pages/vpaaAndVpaa/CampusAssessmentPage"));

export default function App() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext is undefined");
  const { user } = auth;
  useHeartbeat(user, 1000);

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />

        <Route element={<ProtectedRoute allowedRoles={[Roles.ViceChancellorOfAcademicAffairs, Roles.VicePresidentOfAcademicAffairs,]}/>}>
          <Route path="/campus/:department_id/:loaded_course_id/:section_id" element={<CampusAssessmentPage />}/>
          <Route path="/campus/:department_id/:loaded_course_id" element={<CampusCoursePage />}/>
          <Route path="/campus/:department_id" element={<CampusCourseDashboard />}/>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Roles.Dean]} />}>
          <Route path="/college/:department_id/:loaded_course_id/:section_id" element={<DeanAssessmentPage />}/>
          <Route path="/college/:department_id/:loaded_course_id" element={<DeanCoursePage />} />
          <Route path="/college/:department_id" element={<DeanCourseDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[Roles.DepartmentChair]} />}>
          <Route path="/department/:department_id/:loaded_course_id/:section_id" element={<DepartmentChairAssessmentPage />}/>
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
          <Route path="/admin/course_management" element={<AdminCourseDashboard />} />
          <Route path="/admin/user_management" element={<AdminUserDashboard />}/>
        </Route>
      
        
      </Routes>
    </Suspense>
  );
}
