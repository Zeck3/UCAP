import { useNavigate } from "react-router-dom";
import HeaderComponent from "../components/HeaderComponent";
import { courses } from "../data/dummy_data";
import CourseInfoComponent from "../components/CourseInfoComponent";
import MainWrapper from "../components/MainWrapper";
import ToolBarComponent from "../components/ToolBarComponent";

export default function CoursePage() {
  const navigate = useNavigate();
  const courseId = 1;
  const course = courses.find((c) => c.id === courseId);

  const goToClassRecordPage = () => {
    navigate("/course_dashboard/section/class_record");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {course ? <HeaderComponent pageTitle={course.code} /> : null}

      {/* Body */}
      <MainWrapper>
        {course ? (
          <CourseInfoComponent
            name={course.name}
            academicYear={course.academicYear}
            semester={course.semester}
            department={course.department}
            college={course.college}
            campus={course.campus}
          />
        ) : null}
        <ToolBarComponent
          title="My Sections"
          isAdmin={false}
          onCreateClick={() => console.log("Create clicked!")}
          buttonText="N/A"
        />
        <div className="border-t border-[#E9E6E6] w-full"></div>
        {course && course.sections.length === 0 && (
          <div className="flex justify-center items-center h-96">
            <img
              src="/empty-section.svg"
              alt="Empty Section"
              className="h-50 w-50"
            />
          </div>
        )}
        {course && course.sections.length > 0 && (
          <div className="grid grid-cols-2 gap-8 mt-8 w-full">
            {course.sections.map((section, index) => (
              <div
                key={section.id || index}
                onClick={goToClassRecordPage}
                className="bg-white rounded-lg border border-[#E9E6E6] flex flex-col justify-start cursor-pointer transition-transform transform hover:scale-105"
              >
                <div className="flex items-end h-[200px] bg-gradient-to-b from-[#1A1851] to-[#3B36B7] rounded-t-lg">
                  <span className="text-3xl text-white mx-4 mb-2">
                    {section.yearAndSection}
                  </span>
                </div>
                <div className="border-t border-[#E9E6E6] w-full"></div>
                <div className="flex flex-col m-4">
                  <h4 className="w-full text-lg truncate">
                    {formatSchedules(section.schedule)}
                  </h4>
                  <h5 className="text-sm text-[#767676] truncate">
                    LeBron James | {course.department}
                  </h5>
                </div>
              </div>
            ))}
          </div>
        )}
      </MainWrapper>
    </div>
  );
}

function formatTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "pm" : "am";
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;

  return minute === 0
    ? `${formattedHour}${period}`
    : `${formattedHour}:${minute.toString().padStart(2, "0")}${period}`;
}

function formatDay(day: string): string {
  const dayMap: Record<string, string> = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  return dayMap[day] || day;
}

function formatSchedules(
  schedules: { day: string; timeStart: string; timeEnd: string }[]
): string {
  return schedules
    .map(
      (schedule) =>
        `${formatDay(schedule.day)}/${formatTime(
          schedule.timeStart
        )}-${formatTime(schedule.timeEnd)}`
    )
    .join(", ");
}
