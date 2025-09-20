from django.db import models
from django.contrib.auth.hashers import make_password


class Role(models.Model):
    role_id = models.AutoField(serialize=True, primary_key=True)
    role = models.CharField(max_length=255)


class Campus(models.Model):
    campus_id = models.AutoField(serialize=True, primary_key=True)
    campus_name = models.CharField(max_length=225)


class College(models.Model):
    college_id = models.AutoField(serialize=True, primary_key=True)
    college_campus_id = models.ForeignKey(Campus, on_delete=models.CASCADE)
    college_name = models.CharField(max_length=225)


class Department(models.Model):
    department_id = models.AutoField(serialize=True, primary_key=True)
    department_college_id = models.ForeignKey(College, on_delete=models.CASCADE)
    department_campus_id = models.ForeignKey(Campus, on_delete=models.CASCADE)
    department_name = models.CharField(max_length=255)


class User(models.Model):
    user_id = models.IntegerField(primary_key=True)
    user_department_id = models.ForeignKey(
        Department, on_delete=models.CASCADE, blank=True, null=True
    )
    user_role_id = models.ForeignKey(Role, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=255)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255)
    suffix = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)


class Program(models.Model):
    program_id = models.AutoField(serialize=True, primary_key=True)
    program_department_id = models.ForeignKey(Department, on_delete=models.CASCADE)
    program_name = models.CharField(max_length=255)


class AcademicYear(models.Model):
    academic_year_id = models.AutoField(serialize=True, primary_key=True)
    academic_year_start = models.IntegerField()
    academic_year_end = models.IntegerField()


class YearLevel(models.Model):
    year_level_id = models.AutoField(serialize=True, primary_key=True)
    year_level = models.CharField(max_length=255)


class Semester(models.Model):
    semester_id = models.AutoField(serialize=True, primary_key=True)
    semester_type = models.CharField(max_length=255)


class Credit(models.Model):
    credit_id = models.AutoField(serialize=True, primary_key=True)
    lecture_unit = models.IntegerField()
    laboratory_unit = models.IntegerField()
    credit_unit = models.IntegerField()


class Course(models.Model):
    course_code = models.CharField(primary_key=True)
    course_credit_id = models.ForeignKey(Credit, on_delete=models.CASCADE)
    course_program_id = models.ForeignKey(Program, on_delete=models.CASCADE)
    course_year_level_id = models.ForeignKey(YearLevel, on_delete=models.CASCADE)
    course_semester_id = models.ForeignKey(Semester, on_delete=models.CASCADE)
    course_title = models.CharField(max_length=255)


class LoadedCourseTable(models.Model):
    loaded_course_id = models.AutoField(serialize=True, primary_key=True)
    loaded_course_code = models.ForeignKey(Course, on_delete=models.CASCADE)
    loaded_academic_year_id = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)


class Section(models.Model):
    section_id = models.AutoField(serialize=True, primary_key=True)
    section_loaded_course_id = models.ForeignKey(
        LoadedCourseTable, on_delete=models.CASCADE
    )
    section_instructor_assigned_id = models.ForeignKey(User, on_delete=models.CASCADE)
    year_and_section = models.CharField(max_length=225)
    result_sheet_remarks = models.CharField(max_length=225, blank=True, null=True)
    result_sheet_status = models.CharField(max_length=225, blank=True, null=True)


class Student(models.Model):
    student_id = models.IntegerField(primary_key=True)
    student_section_id = models.ForeignKey(Section, on_delete=models.CASCADE)
    student_name = models.CharField(max_length=225)
    remarks = models.CharField(max_length=225)


class CourseTerm(models.Model):
    course_term_id = models.AutoField(serialize=True, primary_key=True)
    course_term = models.CharField(max_length=225)


class CourseUnit(models.Model):
    course_unit_id = models.AutoField(serialize=True, primary_key=True)
    course_unit_term_id = models.ForeignKey(CourseTerm, on_delete=models.CASCADE)
    course_unit = models.CharField(max_length=225)
    course_unit_percentage = models.IntegerField()


class Component(models.Model):
    component_id = models.AutoField(serialize=True, primary_key=True)
    component_course_unit_id = models.ForeignKey(CourseUnit, on_delete=models.CASCADE)
    component_name = models.CharField(max_length=225)
    component_percentage = models.IntegerField()


class Assessment(models.Model):
    assessment_id = models.AutoField(serialize=True, primary_key=True)
    assessment_section_id = models.ForeignKey(Section, on_delete=models.CASCADE)
    assessment_component_id = models.ForeignKey(Component, on_delete=models.CASCADE)
    assessment_title = models.CharField(max_length=225)
    highest_score = models.IntegerField()


class CourseOutcome(models.Model):
    course_outcome_id = models.AutoField(primary_key=True)
    CO_assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    CO_course_code = models.ForeignKey(Course, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)


class ProgramOutcome(models.Model):
    program_outcome_id = models.AutoField(serialize=True, primary_key=True)
    PO_course_code = models.ForeignKey(Course, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)


class AssessmentClassification(models.Model):
    assessment_classification_id = models.AutoField(serialize=True, primary_key=True)
    AC_assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    assessment_classification = models.CharField(max_length=255)


class RawScore(models.Model):
    rawscore_student_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    rawscore_assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    score = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ("rawscore_student_id", "rawscore_assessment_id")


class CO_PO_Mapping(models.Model):
    mapping_program_outcome_id = models.ForeignKey(
        ProgramOutcome, on_delete=models.CASCADE
    )
    mapping_course_outcome_id = models.ForeignKey(
        CourseOutcome, on_delete=models.CASCADE
    )
    mapping = models.CharField(max_length=255)

    class Meta:
        unique_together = ("mapping_program_outcome_id", "mapping_course_outcome_id")
