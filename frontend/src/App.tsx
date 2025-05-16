import {
  Routes,
  Route,
  //Navigate,
} from "react-router-dom";
// import { AuthProvider } from "./context/AuthProvider";
// import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import CourseDashboard from "./pages/CourseDashboard";
import ResultSheetPage from "./pages/ResultSheetPage";
import SectionPage from "./pages/CoursePage";
import ClassRecordPage from "./pages/ClassRecordPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminCourseDashboard from "./pages/AdminCourseDashboard";
import AdminUserDashboard from "./pages/AdminUserDashboard";
import AdminCoursePage from "./pages/AdminCoursePage";
import Sample from  "./pages/sample_register";

// mga commented out lines kay ayha ra i implement pag naa nay mga user roles and authentication

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Instructor routes */}
      <Route path="/course_dashboard" element={<CourseDashboard />} />
      <Route path="/course_dashboard/section/" element={<SectionPage />} />
      <Route path="/course_dashboard/section/class_record" element={<ClassRecordPage />} />

      {/* Admin routes */}
      <Route path="/admin/user_dashboard" element={<AdminUserDashboard />} />
      <Route path="/admin/course_dashboard" element={<AdminCourseDashboard />} />
      <Route path="/admin/course_dashboard/section" element={<AdminCoursePage />} />

      {/* Shared route */}
      <Route path="/course_dashboard/section/course_outcome_assessment" element={<ResultSheetPage />} />

      {/* Catch-all route for unknown pages */}
      <Route path="/sample" element={<Sample />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
