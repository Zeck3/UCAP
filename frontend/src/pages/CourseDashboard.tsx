import { useNavigate } from 'react-router-dom';

const CourseDashboard = () => {
  const navigate = useNavigate();

  const goToSectionPage = () => {
    navigate('/course_dashboard/section/');
  };

  return (
    <div className="font-inter bg-gray-50 text-gray-700 min-h-screen flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between bg-white px-4 py-8 shadow-md">
        <div className="flex items-center space-x-4">
          <img src="/ucap-logo.svg" alt="uCAP Logo" className="h-20 w-auto ml-12" />

          {/* Breadcrumbs */}
          <div className="flex flex-col ml-20">
            <nav className="text-sm text-gray-500 space-x-2 flex items-center">
              <img src="/dashboard-breadcrumb.svg" alt="Dashboard Icon" className="h-4 w-4 inline-block" />
              <span className="hover:underline cursor-pointer">Dashboard</span>
            </nav>

            <div className="flex items-center space-x-2 mt-2">
              <h1 className="text-2xl text-gray-700">Course Dashboard</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 mr-10">
          <img src="/user.png" alt="User" className="w-10 h-10 rounded-full bg-gray-300 object-cover" />
          <span className="text-base font-medium text-gray-700 ml-2 mr-2">LeBron James</span>
          <img src="/down.svg" alt="Custom Icon" className="w-3 h-3" />
        </div>
      </header>

      {/* Body */}
      <main className="px-24 py-10 flex-1">
        <div className="flex items-center justify-start mb-8 space-y-2 sm:space-y-0 sm:flex-nowrap">
          <h2 className="text-xl font-base ml-55 mr-99">My Courses</h2>

          <div className="flex items-center gap-6 justify-start">

            {/* Search */}
            <div className="relative flex-1">
              <img src="/search.svg" alt="Search Icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-auto" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-full shadow-sm w-full bg-white"
              />
            </div>

            {/* Sort */}
            <div className="relative inline-block">
              <img src="/sort.svg" alt="Ascending Icon" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <select className="appearance-none py-1.5 pl-8 pr-10 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white">
                <option>Ascending</option>
                <option>Descending</option>
              </select>
              <div className="pointer-events-none absolute right-8 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-300" />
              <img src="/down.svg" alt="Dropdown Arrow" className="pointer-events-none absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            </div>

            {/* View */}
            <div className="relative inline-block">
              <img src="/cards.svg" alt="Cards Icon" className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-3 h-3" />
              <select className="appearance-none py-1.5 pl-8 pr-10 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white">
                <option>Cards</option>
                <option>List</option>
              </select>
              <div className="pointer-events-none absolute right-8 top-1/2 transform -translate-y-1/2 w-px h-6 bg-gray-300" />
              <img src="/down.svg" alt="Dropdown Arrow" className="pointer-events-none absolute right-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Divider line */}
        <div className="pl-55">
          <div className="border-t border-gray-300 my-8 w-[1079px]"></div>
        </div>

        {/* Courses */}
        <div className="flex justify-center items-center h-96">
          <img src="/empty-courses.svg" alt="Placeholder Icon" className="h-50 w-50" />
        </div>

        {/* Temp Button */}
        <div className="flex items-center justify-center mt-8">
          <button onClick={goToSectionPage} className="bg-yellow-400 text-white px-6 py-3 rounded-lg shadow hover:bg-yellow-500 transition">
            Go to Section Page
          </button>
        </div>
      </main>
    </div>
  );
};

export default CourseDashboard;