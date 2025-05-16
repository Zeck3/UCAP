import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import '/src/styles.css';
import MidtermTable from './Table.tsx';

// Student Object Structure
interface Student {
  id: string;
  name: string;
  scores: (number | undefined)[];
  finalScores: (number | '')[];
}

const ClassRecordPage = () => {
  const navigate = useNavigate();

  // Sample Data for Students
  const [students, setStudents] = useState<Student[]>([
    {
      id: '2025000000',
      name: 'Jane Doe',
      scores: Array(22).fill(undefined),
      finalScores: Array(22).fill(undefined),
    }
  ]);

  // Handle Score Changes Function
  const handleScoreChange = (studentIndex: number, scoreIndex: number, value: string) => {
    const updatedStudents = [...students];
    const parsed = parseFloat(value);

    updatedStudents[studentIndex].scores[scoreIndex] = value === '' ? undefined : isNaN(parsed) ? 0 : parsed;

    setStudents(updatedStudents);
  };

  const handleFinalScoreChange = (studentIndex: number, scoreIndex: number, value: string) => {
    const updatedStudents = [...students];
    const parsed = parseFloat(value);

    updatedStudents[studentIndex].finalScores[scoreIndex] = value === '' ? '' : isNaN(parsed) ? 0 : parsed;

    setStudents(updatedStudents);
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="bg-gray-50 text-gray-700 min-h-screen flex flex-col justify-between">

      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-8 shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-20 w-auto ml-12" />

          {/* Breadcrumbs */}
          <div className="flex flex-col ml-20">
            <nav className="text-sm text-gray-500 space-x-2 flex items-center">
              <img src="/dashboard-breadcrumb.svg" alt="Dashboard Icon" className="h-4 w-4 inline-block" />
              <Link to="/course_dashboard" className="hover:underline cursor-pointer">Dashboard</Link>
              <span>&gt;</span>
              <Link to="/course_dashboard/section/" className="hover:underline cursor-pointer">Course</Link>
              <span>&gt;</span>
              <Link to="/course_dashboard/section/class_record" className="hover:underline cursor-pointer">Section</Link>
            </nav>

            {/* Header Info*/}
            <div className="flex items-center space-x-2 mt-2">
              <button onClick={goBack} className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M25 12H7M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl text-gray-700 ml-8">Course | Section Class Record</h1>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center space-x-2 mr-10">
          <img src="/user.png" alt="User" className="w-10 h-10 rounded-full bg-gray-300 object-cover" />
          <span className="text-base font-medium text-gray-700 ml-2 mr-2">LeBron James</span>
          <img src="/down.svg" alt="Dropdown Arrow" className="w-3 h-3" />
        </div>
      </header>

      {/* Body */}
      <main className="px-12 py-8 flex-grow">
        <MidtermTable
          students={students}
          handleScoreChange={handleScoreChange}
          handleFinalScoreChange={handleFinalScoreChange}
        />
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-12 bg-white shadow-inner mt-auto">
        <div className="flex items-center space-x-6 text-base text-gray-600 ml-12">
          {/* Buttons */}
          <button className="flex items-center space-x-2 hover:underline cursor-pointer">
            <img src="/import.svg" alt="Import" className="w-4 h-4" />
            <span>Import Master List</span>
          </button>
          <button className="flex items-center space-x-2 hover:underline cursor-pointer ml-6">
            <img src="/customize.svg" alt="Customize" className="w-4 h-4" />
            <span>Customize Class Record</span>
          </button>
          <button className="flex items-center space-x-2 hover:underline cursor-pointer ml-6">
            <img src="/export.svg" alt="Export" className="w-4 h-4" />
            <span>Export Class Record</span>
          </button>
        </div>

        {/* Generate Button */}
        <button className="flex items-center space-x-2 bg-ucap-yellow bg-ucap-yellow-hover text-white font-semibold py-2 px-4 rounded-full shadow transition-all duration-200 mr-10">
          <img src="/generate.svg" alt="Generate" className="w-4 h-4" />
          <span>Generate COA Result Sheet</span>
        </button>
      </footer>
    </div>
  );
};

export default ClassRecordPage;