import {
  Routes,
  Route,
  //Navigate,
} from "react-router-dom";
// import { AuthProvider } from "./context/AuthProvider";
// import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import CourseDashboard from "./pages/CourseDashboard";
import UserDashboard from "./pages/UserDashboard";
import ResultSheetPage from "./pages/ResultSheetPage";
import SectionPage from "./pages/SectionPage";
import ClassRecordPage from "./pages/ClassRecordPage";
import UnknownPage from "./pages/UnknownPage";

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
      <Route path="/admin/user_dashboard" element={<UserDashboard />} />
      <Route path="/admin/course_dashboard" element={<CourseDashboard />} />
      <Route path="/admin/course_dashboard/section" element={<UserDashboard />} />

      {/* Shared route */}
      <Route path="/course_dashboard/section/course_outcome_assessment" element={<ResultSheetPage />} />

      {/* Catch-all route for unknown pages */}
      <Route path="sample" element={<UnknownPage />} />
    </Routes>
  );
}

export default App;
