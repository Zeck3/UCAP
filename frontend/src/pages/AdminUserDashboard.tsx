import HeaderComponent from "../components/HeaderComponent";
import ToolBarComponent from "../components/ToolBarComponent";
import MainWrapper from "../components/MainWrapper";
import SidePanel from "../components/SidePanelComponent";
import { useState } from "react";
import UserInputComponent from "../components/UserInputComponent";
import DropdownComponent from "../components/DropDownComponent";
import SideBarComponent from "../components/SideBarComponent";

export default function AdminUserDashboard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-row">
      <SideBarComponent />
      <div className="flex flex-1 flex-col">
        <HeaderComponent pageTitle="User Dashboard" isAdmin={true} />
        <MainWrapper isAdmin={true}>
          <ToolBarComponent
            title="All Instructors"
            isAdmin={true}
            onCreateClick={() => setIsPanelOpen(true)}
            buttonText="Add Instructor"
          />
          <div className="border-t border-[#E9E6E6] w-full"></div>

          <div className="flex justify-center items-center h-96">
            <img
              src="/empty-instructors.svg"
              alt="Empty Instructors"
              className="h-50 w-50"
            />
          </div>
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
