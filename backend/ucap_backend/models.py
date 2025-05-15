from django.db import models
from django.contrib.auth.hashers import make_password


class Role(models.Model):
    role_id = models.AutoField(serialize=True, primary_key=True)
    role_type = models.CharField(max_length=255) 

    def __str__(self):
        return self.role_type

class User(models.Model):
    user_id = models.IntegerField(primary_key=True)
    role_id = models.ForeignKey(Role, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=255)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255)
    suffix = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    
    def save(self, *args, **kwargs):
        if not self.pk or not User.objects.filter(pk=self.pk, password=self.password).exists():
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Campus(models.Model):
    campus_id = models.AutoField(serialize=True, primary_key=True)
    campus_name = models.CharField(max_length=225)

class College(models.Model):
    college_id = models.AutoField(serialize=True, primary_key=True)
    campus_id = models.ForeignKey(Campus, on_delete=models.CASCADE)
    college_name = models.CharField(max_length=225)

class Department(models.Model):
    department_id = models.AutoField(serialize=True, primary_key=True)
    college_id = models.ForeignKey(College, on_delete=models.CASCADE)
    campus_id = models.ForeignKey(Campus, on_delete=models.CASCADE)
    department_name = models.CharField(max_length=255)

class Program(models.Model):
    program_id = models.AutoField(serialize=True, primary_key=True)
    department_id = models.ForeignKey(Department, on_delete=models.CASCADE)
    program_name = models.CharField(max_length=255)

class AcademicYear(models.Model):
    academic_year_id = models.AutoField(serialize=True, primary_key=True)
    academic_year_start = models.IntegerField()
    academic_year_end = models.IntegerField()

class Credit(models.Model):
    credit_id = models.AutoField(serialize=True, primary_key=True)
    lecture_unit = models.IntegerField()
    laboratory_unit = models.IntegerField()

class Semester(models.Model):
    semester_id = models.AutoField(serialize=True, primary_key=True) 
    semester_type = models.CharField(max_length=255)

class Course(models.Model):
    course_code = models.IntegerField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    credit_id = models.ForeignKey(Credit, on_delete=models.CASCADE)
    program_id = models.ForeignKey(Program, on_delete=models.CASCADE)
    acad_year_id = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    semester_id = models.ForeignKey(Semester, on_delete=models.CASCADE)
    course_title = models.CharField(max_length=255)

class RoomAndSchedule(models.Model):
    room_and_schedule_id = models.AutoField(serialize=True, primary_key=True)
    day_of_the_week = models.CharField(max_length=225)
    time_starts = models.TimeField()
    time_ends = models.TimeField()
    building_and_room = models.CharField(max_length=225)

class Section(models.Model):
    section_id = models.AutoField(serialize=True, primary_key=True)
    course_id = models.ForeignKey(Course, on_delete=models.CASCADE)
    instructor_assigned_id = models.ForeignKey(User, on_delete=models.CASCADE)
    room_and_schedule_id = models.ForeignKey(RoomAndSchedule, on_delete=models.CASCADE, null=True, blank=True)
    year_and_section = models.CharField(max_length=225)

class Student(models.Model):
    student_id = models.IntegerField(primary_key=True)
    section_id = models.ForeignKey(Section, on_delete=models.CASCADE)
    student_name = models.CharField(max_length=225)

class CourseTerm(models.Model):
    course_term_id = models.AutoField(serialize=True, primary_key=True)
    course_term = models.CharField(max_length=225)

class CourseUnit(models.Model):
    course_unit_id = models.AutoField(serialize=True, primary_key=True)
    course_term_id = models.ForeignKey(CourseTerm, on_delete=models.CASCADE)
    course_unit = models.CharField(max_length=225)
    course_unit_percentage = models.IntegerField()

class Component(models.Model):
    component_id = models.AutoField(serialize=True, primary_key=True)
    course_unit_id = models.ForeignKey(CourseUnit, on_delete=models.CASCADE)
    component_name = models.CharField(max_length=225)
    component_percentage = models.IntegerField()

class Assessment(models.Model):
    assessment_id = models.AutoField(serialize=True, primary_key=True)
    component_id = models.ForeignKey(Component, on_delete=models.CASCADE)
    assessment_title = models.CharField(max_length=225)
    highest_score = models.IntegerField()

class CourseOutcome(models.Model):
    course_outcome_id = models.AutoField(primary_key=True)
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    course_outcome = models.CharField(max_length=225)

class ProgramOutcome(models.Model):
    program_outcome_id = models.AutoField(serialize=True, primary_key=True)
    course_outcome_id = models.ForeignKey(CourseOutcome, on_delete=models.CASCADE)
    program_outcome = models.CharField(max_length=255)

class AssessmentClassification(models.Model):
    assessment_classification_id = models.AutoField(serialize=True, primary_key=True)
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    assessment_classification = models.CharField(max_length=255)

class RawScore(models.Model):
    raw_score_id = models.AutoField(serialize=True, primary_key=True)
    student_id = models.ForeignKey(Student, on_delete=models.CASCADE)
    assessment_id = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    score = models.IntegerField(null=True, blank=True)

