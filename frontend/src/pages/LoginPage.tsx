import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const goToCourseDashboard = () => {
    navigate('/course_dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <button
        onClick={goToCourseDashboard}
        className="bg-yellow-400 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition"
      >
        Go to Course Dashboard
      </button>
    </div>
  );
};

export default LoginPage;