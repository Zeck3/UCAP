from .models import *

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

    for _ in range(1):
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
                 "Mid Written Exam" if term_type == "Midterm" else "SFinal Exam"),
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