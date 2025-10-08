import type { ClassRecord } from "../../types/classRecordTypes";

export const crpInfo: ClassRecord = {
  info: {
    department: "Department of Electronics Engineering",
    subject: "EC 415",
    yearSection: "4A_1",
  },
  course_terms: [
    {
      course_term_id: 1,
      course_term_type: "Midterm",
      section_id: 1,
      course_units: [
        {
          course_unit_id: 1,
          course_unit_type: "Lecture",
          course_unit_percentage: 50,
          course_components: [
            {
              course_component_id: 1,
              course_component_type: "Class Standing Performance Items",
              course_component_percentage: 10,
              assessments: [
 
                {
                  assessment_id: 4,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
                {
                  assessment_id: 5,
                  assessment_title: "",
                  assessment_highest_score: 15,
                },
              ],
            },
            {
              course_component_id: 2,
              course_component_type: "Quiz/Prelim Performance Item",
              course_component_percentage: 40,
              assessments: [
                {
                  assessment_id: 6,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
                {
                  assessment_id: 7,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
                {
                  assessment_id: 8,
                  assessment_title: "",
                  assessment_highest_score: 50,
                },
                {
                  assessment_id: 9,
                  assessment_title: "",
                  assessment_highest_score: 60,
                },
                {
                  assessment_id: 10,
                  assessment_title: "Prelim Exam",
                  assessment_highest_score: 25,
                },
              ],
            },
            {
              course_component_id: 3,
              course_component_type: "Midterm Exam",
              course_component_percentage: 30,
              assessments: [
                {
                  assessment_id: 11,
                  assessment_title: "Mid Written Exam",
                  assessment_highest_score: 100,
                },
              ],
            },
            {
              course_component_id: 4,
              course_component_type: "Per Inno Task",
              course_component_percentage: 20,
              assessments: [
                {
                  assessment_id: 12,
                  assessment_title: "PIT 1",
                  assessment_highest_score: 50,
                },
                {
                  assessment_id: 13,
                  assessment_title: "PIT 2",
                  assessment_highest_score: 50,
                },
              ],
            },
          ],
        },
        {
          course_unit_id: 2,
          course_unit_type: "Laboratory",
          course_unit_percentage: 50,
          course_components: [
            {
              course_component_id: 5,
              course_component_type: "Lab Exercises/Reports",
              course_component_percentage: 30,
              assessments: [
                {
                  assessment_id: 14,
                  assessment_title: "",
                  assessment_highest_score: 50,
                },
                {
                  assessment_id: 15,
                  assessment_title: "",
                  assessment_highest_score: 50,
                },
                {
                  assessment_id: 16,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
                {
                  assessment_id: 17,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
                {
                  assessment_id: 18,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
              ],
            },
            {
              course_component_id: 6,
              course_component_type: "Hands-On Exercises",
              course_component_percentage: 30,
              assessments: [
                {
                  assessment_id: 19,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
                {
                  assessment_id: 20,
                  assessment_title: "",
                  assessment_highest_score: 40,
                },
                {
                  assessment_id: 21,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
              ],
            },
            {
              course_component_id: 7,
              course_component_type: "Lab Major Exam",
              course_component_percentage: 40,
              assessments: [
                {
                  assessment_id: 22,
                  assessment_title: "Mid Lab Exam",
                  assessment_highest_score: 100,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      course_term_id: 2,
      course_term_type: "Final",
      section_id: 1,
      course_units: [
        {
          course_unit_id: 3,
          course_unit_type: "Lecture",
          course_unit_percentage: 50,
          course_components: [
            {
              course_component_id: 8,
              course_component_type: "Class Standing Performance Items",
              course_component_percentage: 10,
              assessments: [
                {
                  assessment_id: 23,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
                {
                  assessment_id: 24,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
                {
                  assessment_id: 25,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
                {
                  assessment_id: 26,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
              ],
            },
            {
              course_component_id: 9,
              course_component_type: "Quiz/Pre-Final Performance Item",
              course_component_percentage: 40,
              assessments: [
                {
                  assessment_id: 27,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
                {
                  assessment_id: 28,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
                {
                  assessment_id: 29,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
                {
                  assessment_id: 30,
                  assessment_title: "SFinal Exam",
                  assessment_highest_score: 50,
                },
              ],
            },
            {
              course_component_id: 10,
              course_component_type: "Final Exam",
              course_component_percentage: 30,
              assessments: [
                {
                  assessment_id: 31,
                  assessment_title: "Fin Written Exam",
                  assessment_highest_score: 100,
                },
              ],
            },
            {
              course_component_id: 11,
              course_component_type: "Per Inno Task",
              course_component_percentage: 20,
              assessments: [
                {
                  assessment_id: 32,
                  assessment_title: "PIT 1",
                  assessment_highest_score: 50,
                },
                {
                  assessment_id: 33,
                  assessment_title: "PIT 2",
                  assessment_highest_score: 50,
                },
              ],
            },
          ],
        },
        {
          course_unit_id: 4,
          course_unit_type: "Laboratory",
          course_unit_percentage: 50,
          course_components: [
            {
              course_component_id: 12,
              course_component_type: "Lab Exercises/Reports",
              course_component_percentage: 30,
              assessments: [
                {
                  assessment_id: 34,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
                {
                  assessment_id: 35,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
                {
                  assessment_id: 36,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
                {
                  assessment_id: 37,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
                {
                  assessment_id: 38,
                  assessment_title: "",
                  assessment_highest_score: 20,
                },
              ],
            },
            {
              course_component_id: 13,
              course_component_type: "Hands-On Exercises",
              course_component_percentage: 30,
              assessments: [
                {
                  assessment_id: 39,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
                {
                  assessment_id: 40,
                  assessment_title: "",
                  assessment_highest_score: 10,
                },
                {
                  assessment_id: 41,
                  assessment_title: "",
                  assessment_highest_score: 30,
                },
              ],
            },
            {
              course_component_id: 14,
              course_component_type: "Lab Major Exam",
              course_component_percentage: 40,
              assessments: [
                {
                  assessment_id: 42,
                  assessment_title: "Fin Lab Exam",
                  assessment_highest_score: 100,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  students: [
    {
      student_id: 1,
      id_number: 2025000002,
      student_name: "Josuke Higashikata",
      scores: [
        { assessment_id: 1, value: 15 },
        { assessment_id: 11, value: 95 },
      ],
      remarks: "Passed",
      section_id: 1,
    },
    {
      student_id: 2,
      id_number: 2025000002,
      student_name: "Josuke Higashikata",
      scores: [
        { assessment_id: 1, value: 15 },
        { assessment_id: 11, value: 95 },
      ],
      remarks: "Passed",
      section_id: 1,
    },
    {
      student_id: 3,
      id_number: 2025000002,
      student_name: "Josuke Higashikata",
      scores: [
        { assessment_id: 1, value: 15 },
        { assessment_id: 11, value: 95 },
      ],
      remarks: "Passed",
      section_id: 1,
    },
  ],
};
