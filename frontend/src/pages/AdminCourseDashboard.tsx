import { useNavigate } from "react-router-dom";
import HeaderComponent from "../components/HeaderComponent";
import ToolBarComponent from "../components/ToolBarComponent";
import MainWrapper from "../components/MainWrapper";
import { courses } from "../data/dummy_data";
import SidePanel from "../components/SidePanelComponent";
import { useState } from "react";
import UserInputComponent from "../components/UserInputComponent";
import DropdownComponent from "../components/DropDownComponent";
import SideBarComponent from "../components/SideBarComponent";

export default function AdminCourseDashboard() {
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const goToSectionPage = () => {
    navigate("/admin/course_dashboard/section");
  };

  return (
    <div className="min-h-screen flex flex-row">
      <SideBarComponent />
      <div className="flex flex-1 flex-col">
        <HeaderComponent pageTitle="Course Dashboard" isAdmin={true} />
        <MainWrapper isAdmin={true}>
          <ToolBarComponent
            title="All Courses"
            isAdmin={true}
            onCreateClick={() => setIsPanelOpen(true)}
            buttonText="Add Course"
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
      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        panelFunction="Add Course"
        submit={() => console.log("API Request POST")}
        fullWidthRow={false}
        buttonFunction="Create Course"
      >
        <UserInputComponent label="Course Code" name="courseCode" />
        <DropdownComponent
          label="Campus"
          name="campus"
          options={[
            "USTP-Cagayan De Oro Campus",
            "USTP-Claveria Campus",
            "USTP-Alubijid Campus",
            "USTP-Villanueva Campus",
            "USTP-Jasaan Campus",
            "USTP-Oroquieta Campus",
            "USTP-Balubal Campus",
          ]}
        />
        <UserInputComponent label="Course Title" name="courseTitle" />
        <DropdownComponent
          label="College"
          name="college"
          options={[
            "College of Information Technology and Computing",
            "College of Technology",
            "College of Civil Engineering and Architecture",
            "College of Science and Technology Education",
            "College of Science and Mathematics",
            "College of Medicine",
          ]}
        />
        <DropdownComponent
          label="Credit Unit"
          name="creditUnit"
          options={[
            "Lecture Only",
            "Lec 50% and Lab 50% for 2 units",
            "Lec 67% and Lab 33% for 3 units",
            "Lec 75% and Lab 25% for 4 units",
          ]}
        />
        <DropdownComponent
          label="Department"
          name="department"
          options={[
            "Department of Information Technology",
            "Department of Civil Engineering",
            "Department of Environmental Science",
            "Department of etc.",
          ]}
        />
        <DropdownComponent
          label="Academic Year"
          name="academicYear"
          options={["2024-2025", "2025-2026"]}
        />
        <DropdownComponent
          label="Program"
          name="program"
          options={[
            "Information Technology",
            "Civil Engineering",
            "Environmental Science",
            "etc.",
          ]}
        />
        <DropdownComponent
          label="Program"
          name="program"
          options={["1st Semester", "2nd Semester", "Mid Year"]}
        />
      </SidePanel>
    </div>
  );
}
