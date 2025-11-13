from .models import *

def populate_default_data():
    # ===================================
    # University Hierarchy
    # ===================================
    campus_1, _ = Campus.objects.get_or_create(campus_name="USTP-CDO")

    college_1, _ = College.objects.get_or_create(
        campus=campus_1, college_name="College of Engineering and Architecture"
    )
    college_2, _ = College.objects.get_or_create(
        campus=campus_1, college_name="College of Information Technology and Computing"
    )

    department_1, _ = Department.objects.get_or_create(
        campus=campus_1, college=college_1, department_name="Electronics Engineering"
    )
    department_2, _ = Department.objects.get_or_create(
        campus=campus_1, college=college_2, department_name="Information Technology"
    )

    program_1, _ = Program.objects.get_or_create(
        department=department_1, program_name="Bachelor of Science in Electronics Engineering"
    )
    program_2, _ = Program.objects.get_or_create(
        department=department_2, program_name="Bachelor of Science in Information Technology"
    )

    # ===================================
    # Roles and Users
    # ===================================
    roles = [
        "Administrator",
        "Instructor",
        "Department Chair",
        "Dean",
        "Vice Chancellor of Academic Affairs",
        "Vice President of Academic Affairs",
    ]

    role_objs = {r: UserRole.objects.get_or_create(user_role_type=r)[0] for r in roles}

    users_data = [
        {"user_id": 1, "role": "Administrator", "last_name": "Administrator", "email": "admin@example.com"},
        {"user_id": 2025396865, "role": "Instructor", "first_name": "Kujo", "last_name": "Jotaro", "email": "kujo.jotaro234@ustp.edu.ph", "department": department_1},
        {"user_id": 2025407938, "role": "Instructor", "first_name": "Jean Pierre", "last_name": "Polnareff", "email": "jeanpierre.75polnareff@ustp.edu.ph", "department": department_1},
        {"user_id": 2025678934, "role": "Department Chair", "first_name": "Robert", "last_name": "Speedwagon", "email": "Speedwagon056@ustp.edu.ph", "department": department_1},
        {"user_id": 2025583422, "role": "Dean", "first_name": "Lisa", "last_name": "Lisa", "email": "lisalisa@ustp.edu.ph", "department": department_1},
        {"user_id": 2025547491, "role": "Vice Chancellor of Academic Affairs", "last_name": "Diavolo", "email": "diavolerolero@example.com", "department": department_1},
        {"user_id": 2025787146, "role": "Vice President of Academic Affairs", "last_name": "Kars", "email": "kars2005@ustp.edu.ph", "department": department_1},
    ]

    for user_data in users_data:
        role = role_objs[user_data.pop("role")]
        user_id = user_data.pop("user_id")
        user = User.objects.create_user(
            user_id=user_id,
            user_role=role,
            **user_data
        )
    # ===================================
    # Courses
    # ===================================
    year_levels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
    year_level_objs = {yl: YearLevel.objects.get_or_create(year_level_type=yl)[0] for yl in year_levels}

    semesters = ["1st Semester", "2nd Semester", "Midyear"]
    semester_objs = {sem: Semester.objects.get_or_create(semester_type=sem)[0] for sem in semesters}

    def get_credit(lec, lab, credit):
        obj, _ = Credit.objects.get_or_create(
            lecture_unit=lec, laboratory_unit=lab, credit_unit=credit
        )
        return obj

    courses_data = [
        ("ECE121", "Introduction to Electronics Engineering", "1st Year", "2nd Semester", 1, 1, 2),
        ("ECE212", "Electronics 1 (Electronic Devices & Circuits)", "2nd Year", "1st Semester", 3, 1, 4),
        ("ECE210", "ECE Laws, Contract, Ethics, Standards & Safety", "2nd Year", "1st Semester", 3, 0, 3),
        ("ECE223", "Electronics 2 (Electronic Circuit Analysis & Design)", "2nd Year", "2nd Semester", 3, 1, 4),
        ("ECE221", "Communications 1 (Principles of Communications)", "2nd Year", "2nd Semester", 3, 1, 4),
        ("ECE220", "Advance Engineering Mathematics for ECE", "2nd Year", "2nd Semester", 3, 1, 4),
        ("ECE222", "Electromagnetics for ECE", "2nd Year", "2nd Semester", 4, 0, 4),
        ("ECE314", "Electronics 3 (Electronic Systems & Design)", "3rd Year", "1st Semester", 3, 1, 4),
        ("ECE313", "Communications 2 (Modulation and Coding Techniques)", "3rd Year", "1st Semester", 3, 1, 4),
        ("ECE311", "Numerical Methods (Computer Methods in ECE)", "3rd Year", "1st Semester", 2, 1, 3),
        ("ECE312", "Digital Electronics 1: Logic Circuits & Switching Theory", "3rd Year", "1st Semester", 3, 1, 4),
        ("ECE315", "Feedback & Control Systems", "3rd Year", "1st Semester", 3, 1, 4),
        ("ECE310", "Methods of Research", "3rd Year", "1st Semester", 3, 0, 3),
        ("ECE324", "Communications 3 (Data Communications)", "3rd Year", "2nd Semester", 3, 1, 4),
        ("ECE325", "Communications 4 (Transmission Media, Antenna System and Design)", "3rd Year", "2nd Semester", 3, 1, 4),
        ("ECE323", "Digital Electronics 2: Microprocessor & Microcontroller Systems", "3rd Year", "2nd Semester", 3, 1, 4),
        ("ECE320", "Design Capstone 1", "3rd Year", "2nd Semester", 0, 1, 1),
        ("ECE321", "ECE Technical Elective 1", "3rd Year", "2nd Semester", 3, 1, 4),
        ("ECE322", "Signals, Spectra & Signal Processing", "3rd Year", "2nd Semester", 3, 1, 4),
        ("ECECSE330", "ECE Competency and Skills Enhancement 1", "3rd Year", "Midyear", 0, 1, 1),
        ("ECE410", "Design Capstone 2", "4th Year", "1st Semester", 0, 1, 1),
        ("ECE411", "Communications System Analysis and Design", "4th Year", "1st Semester", 2, 1, 3),
        ("ECE412", "ECE Technical Elective 2", "4th Year", "1st Semester", 3, 1, 4),
        ("ECE413", "Seminars/Colloquia", "4th Year", "1st Semester", 0, 1, 1),
        ("ECECSE410", "ECE Competency and Skills Enhancement 2", "4th Year", "1st Semester", 0, 2, 2),
        ("ECE420", "On The Job Training (Minimum of 480 hours)", "4th Year", "2nd Semester", 3, 0, 3),
    ]

    for code, title, yl, sem, lec, lab, cred in courses_data:
        Course.objects.get_or_create(
            course_code=code,
            defaults={
                "course_title": title,
                "program": program_1,
                "year_level": year_level_objs[yl],
                "semester": semester_objs[sem],
                "credit": get_credit(lec, lab, cred),
            },
        )

    # ===================================
    # Blooms Taxonomy
    # ===================================
    bloom_levels = [
        "Remember",
        "Understand",
        "Apply",
        "Analyze",
        "Evaluate",
        "Create",
    ]

    for level in bloom_levels:
            BloomsClassification.objects.get_or_create(blooms_classification_type=level)

    # ===================================
    # Academic Year
    # ===================================
    academic_year_2025, _ = AcademicYear.objects.get_or_create(
        academic_year_start=2025, 
        academic_year_end=2026
    )


def create_class_record_service(section):
    loaded_course = section.loaded_course
    course = loaded_course.course
    credit = course.credit

    lecture_units = credit.lecture_unit
    lab_units = credit.laboratory_unit
    total_units = lecture_units + lab_units

    lecture_pct = round((lecture_units / total_units) * 100) if lecture_units > 0 else 0
    lab_pct = 100 - lecture_pct if lab_units > 0 else 0

    course_terms = ["Midterm", "Final"]

    for _ in range(40):
        Student.objects.create(
            section=section,
            id_number=None,
            student_name=None,
            remarks=None
        )

    students = Student.objects.filter(section=section)

    for term_type in course_terms:
        term = CourseTerm.objects.create(
            section=section,
            course_term_type=term_type
        )

        if lecture_units > 0:
            lecture_unit = CourseUnit.objects.create(
                course_term=term,
                course_unit_type="Lecture",
                course_unit_percentage=lecture_pct
            )
            lecture_components = [
                ("Class Standing Performance Items", 10, 5, None),
                ("Quiz/Prelim Performance Item" if term_type == "Midterm" else "Quiz/Pre-final Performance Item", 40, 4,
                 "Prelim Exam" if term_type == "Midterm" else "SFinal Exam"),
                ("Midterm Exam" if term_type == "Midterm" else "Final Exam", 30, 0,
                 "Mid Written Exam" if term_type == "Midterm" else "Fin Written Exam"),
                ("Per Inno Task", 20, 2, None),
            ]
            for comp_name, comp_percentage, empty_assessments, special_assessment in lecture_components:
                comp = CourseComponent.objects.create(
                    course_unit=lecture_unit,
                    course_component_type=comp_name,
                    course_component_percentage=comp_percentage
                )
                titles = [None] * empty_assessments
                if special_assessment:
                    titles.append(special_assessment)

                for title in titles:
                    assessment = Assessment.objects.create(
                        course_component=comp,
                        assessment_title=title
                    )
                    RawScore.objects.bulk_create([
                        RawScore(student=student, assessment=assessment)
                        for student in students
                    ])

        if lab_units > 0:
            lab_unit = CourseUnit.objects.create(
                course_term=term,
                course_unit_type="Laboratory",
                course_unit_percentage=lab_pct
            )
            lab_components = [
                ("Lab Exercises/Reports", 30, 5, None),
                ("Hands on Exercises", 30, 3, None),
                ("Lab Major Exam", 40, 0,
                 "Mid Lab Exam" if term_type == "Midterm" else "Fin Lab Exam"),
            ]
            for comp_name, comp_percentage, empty_assessments, special_assessment in lab_components:
                comp = CourseComponent.objects.create(
                    course_unit=lab_unit,
                    course_component_type=comp_name,
                    course_component_percentage=comp_percentage
                )
                titles = [None] * empty_assessments
                if special_assessment:
                    titles.append(special_assessment)

                for title in titles:
                    assessment = Assessment.objects.create(
                        course_component=comp,
                        assessment_title=title
                    )
                    RawScore.objects.bulk_create([
                        RawScore(student=student, assessment=assessment)
                        for student in students
                    ])