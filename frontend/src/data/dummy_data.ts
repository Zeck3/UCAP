export const courses = [
  {
    id: 1,
    code: "ECE 415",
    name: "Communication System Analysis and Design",
    academicYear: "2025-2026",
    semester: "1st Semester",
    department: "Department of Electronics Engineering",
    college: "College of Engineering and Architecture",
    campus: "USTP-CDO Campus",
    sections: [
      {
        id: 1,
        yearAndSection: "4A_1",
        instructor: {
          id: 1,
          name: "Dr. Lory Liza D. Bulay-og",
          email: "lory_liza@ustp.edu.ph"
        },
        schedule: [
          {
            day: "Monday",
            timeStart: "08:00",
            timeEnd: "10:00",
            building: "Engineering Building",
            room: "42-204"
          },
          {
            day: "Wednesday",
            timeStart: "08:00",
            timeEnd: "10:00",
            building: "Engineering Building",
            room: "42-204"
          }
        ]
      }
    ]
  }
];
