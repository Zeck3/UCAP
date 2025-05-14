import { useNavigate } from "react-router-dom";
import HeaderComponent from "../components/HeaderComponent";
import ToolBarComponent from "../components/ToolBarComponent";
import MainWrapper from "../components/MainWrapper";
import { courses } from "../data/dummy_data";

export default function CourseDashboard() {
  const navigate = useNavigate();
  const goToSectionPage = () => {
    navigate("/course_dashboard/section");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderComponent pageTitle="Course Dashboard" />
      <MainWrapper>
        <ToolBarComponent
          title="My Courses"
          isAdmin={false}
          onCreateClick={() => console.log("Create clicked!")}
          buttonText="N/A"
        />
        <div className="border-t border-[#E9E6E6] w-full"></div>
        {courses.length === 0 && (
          <div className="flex justify-center items-center h-96">
            <img
              src="/empty-courses.svg"
              alt="Empty Courses"
              className="h-50 w-50"
            />
          </div>
        )}
        {courses.length > 0 && (
          <div className="grid grid-cols-2 gap-8 mt-8 w-full">
            {courses.map((courses, index) => (
              <div
                key={index}
                onClick={goToSectionPage}
                className="bg-white rounded-lg border border-[#E9E6E6] flex flex-col justify-start cursor-pointer transition-transform transform hover:scale-105"
              >
                <div className="flex items-end h-[200px] bg-gradient-to-b from-[#1A1851] to-[#3B36B7] rounded-t-lg">
                  <span className="text-3xl text-white mx-4 mb-2">
                    {courses.code}
                  </span>
                </div>
                <div className="border-t border-[#E9E6E6] w-full"></div>
                <div className="flex flex-col m-4">
                  <h4 className="w-full text-lg truncate">{courses.name}</h4>
                  <h5 className="text-sm text-[#767676] truncate">
                    {courses.academicYear} {courses.semester} |{" "}
                    {courses.department}{" "}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        )}
      </MainWrapper>
    </div>
  );
};
