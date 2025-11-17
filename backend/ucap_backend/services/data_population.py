from ucap_backend.models import *

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
        department=department_1, program_name="BS in Electronics Engineering"
    )
    program_2, _ = Program.objects.get_or_create(
        department=department_2, program_name="BS in Information Technology"
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