from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# ====================================================
# Login Authentication and User Management
# ====================================================
class UserManager(BaseUserManager):
    def create_user(self, user_id, password=None, **extra_fields):
        if not user_id:
            raise ValueError("The User ID must be set")

        if not password:
            password = str(user_id)

        user = self.model(user_id=user_id, **extra_fields)

        if user.user_role and user.user_role.user_role_type == "Administrator":
            user.is_staff = True
            user.is_superuser = True

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_id, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not password:
            password = str(user_id)

        return self.create_user(user_id, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.IntegerField(primary_key=True)
    department = models.ForeignKey("Department", on_delete=models.SET_NULL, null=True)
    user_role = models.ForeignKey("UserRole", on_delete=models.SET_NULL, null=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255)
    suffix = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=255, unique=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "user_id"

    def __str__(self):
        return str(self.user_id)

class UserRole(models.Model):
    user_role_id = models.AutoField(serialize=True, primary_key=True)
    user_role_type = models.CharField(max_length=255)

# ====================================================
# University Hierarchy 
# ====================================================
class Campus(models.Model):
    campus_id = models.AutoField(serialize=True, primary_key=True)
    campus_name = models.CharField(max_length=225)

class College(models.Model):
    college_id = models.AutoField(serialize=True, primary_key=True)
    campus = models.ForeignKey("Campus", on_delete=models.CASCADE)
    college_name = models.CharField(max_length=225)

class Department(models.Model):
    department_id = models.AutoField(serialize=True, primary_key=True)
    college = models.ForeignKey("College", on_delete=models.CASCADE, blank=True, null=True)
    campus = models.ForeignKey("Campus", on_delete=models.CASCADE)
    department_name = models.CharField(max_length=255)

class Program(models.Model):
    program_id = models.AutoField(serialize=True, primary_key=True)
    department = models.ForeignKey("Department", on_delete=models.CASCADE)
    program_name = models.CharField(max_length=255)

# ====================================================
# Course Information
# ====================================================
class YearLevel(models.Model):
    year_level_id = models.AutoField(serialize=True, primary_key=True)
    year_level_type = models.CharField(max_length=255)

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
    program = models.ForeignKey("Program", on_delete=models.CASCADE)
    year_level = models.ForeignKey("YearLevel", on_delete=models.PROTECT)
    semester = models.ForeignKey("Semester", on_delete=models.PROTECT)
    credit = models.ForeignKey("Credit", on_delete=models.PROTECT)
    course_title = models.CharField(max_length=255)

# ====================================================
# Loaded Course Information
# ====================================================
class AcademicYear(models.Model):
    academic_year_id = models.AutoField(serialize=True, primary_key=True)
    academic_year_start = models.IntegerField()
    academic_year_end = models.IntegerField()

class LoadedCourse(models.Model):
    loaded_course_id = models.AutoField(serialize=True, primary_key=True)
    course = models.ForeignKey("Course", on_delete=models.CASCADE)
    academic_year = models.ForeignKey("AcademicYear", on_delete=models.PROTECT)

# ====================================================
# Section Information
# ====================================================
class Section(models.Model):
    section_id = models.AutoField(primary_key=True)
    loaded_course = models.ForeignKey("LoadedCourse", on_delete=models.CASCADE)
    instructor_assigned = models.ForeignKey("User", on_delete=models.SET_NULL, null=True, blank=True)
    year_and_section = models.CharField(max_length=225)
    result_sheet_remarks = models.CharField(max_length=225, blank=True, null=True)
    result_sheet_status = models.CharField(max_length=225, blank=True, null=True)

class Student(models.Model):
    student_id = models.AutoField(primary_key=True)
    id_number = models.IntegerField(blank=True, null=True)
    section = models.ForeignKey("Section", on_delete=models.CASCADE)
    student_name = models.CharField(max_length=225, blank=True, null=True)
    remarks = models.CharField(max_length=225, blank=True, null=True)
    class Meta:
        unique_together = ("student_id", "section")

# ====================================================
# Global Class Record Template for Loaded Course
# ====================================================
class CourseTerm(models.Model):
    course_term_id = models.AutoField(primary_key=True)
    loaded_course = models.ForeignKey("LoadedCourse", on_delete=models.CASCADE)
    course_term_type = models.CharField(max_length=225)

class CourseUnit(models.Model):
    course_unit_id = models.AutoField(primary_key=True)
    course_term = models.ForeignKey("CourseTerm", on_delete=models.CASCADE)
    course_unit_type = models.CharField(max_length=225)
    course_unit_percentage = models.IntegerField()

class CourseComponent(models.Model):
    course_component_id = models.AutoField(primary_key=True)
    course_unit = models.ForeignKey("CourseUnit", on_delete=models.CASCADE)
    course_component_type = models.CharField(max_length=225)
    course_component_percentage = models.IntegerField()

# ====================================================
# Section-Specific Class Record
# ====================================================
class SectionCourseTerm(models.Model):
    section_course_term_id = models.AutoField(primary_key=True)
    section = models.ForeignKey("Section", on_delete=models.CASCADE)
    section_course_term_type = models.CharField(max_length=225)

class SectionCourseUnit(models.Model):
    section_course_unit_id = models.AutoField(primary_key=True)
    section_course_term = models.ForeignKey("SectionCourseTerm", on_delete=models.CASCADE)
    section_course_unit_type = models.CharField(max_length=225)
    section_course_unit_percentage = models.IntegerField()

class SectionCourseComponent(models.Model):
    section_course_component_id = models.AutoField(primary_key=True)
    section_course_unit = models.ForeignKey("SectionCourseUnit", on_delete=models.CASCADE)
    section_course_component_name = models.CharField(max_length=225)
    section_course_component_percentage = models.IntegerField()

# ====================================================
# Assessments
# ====================================================
class Assessment(models.Model):
    assessment_id = models.AutoField(primary_key=True)
    section = models.ForeignKey("Section", on_delete=models.CASCADE)
    section_component = models.ForeignKey("SectionCourseComponent", on_delete=models.CASCADE)
    blooms_classification = models.ForeignKey("BloomsClassification", on_delete=models.SET_NULL, null=True, blank=True)
    course_outcomes = models.ManyToManyField("CourseOutcome", through="AssessmentCourseOutcome")
    assessment_title = models.CharField(max_length=225, null=True, blank=True)
    assessment_highest_score = models.IntegerField(null=True, blank=True)

class RawScore(models.Model):
    student = models.ForeignKey("Student", on_delete=models.CASCADE)
    assessment = models.ForeignKey("Assessment", on_delete=models.CASCADE)
    raw_score = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ("student", "assessment")

# ====================================================
# Assessment Information and Outcome Mapping
# ====================================================
class CourseOutcome(models.Model):
    course_outcome_id = models.AutoField(primary_key=True)
    course = models.ForeignKey("Course", on_delete=models.CASCADE)
    course_outcome_description = models.CharField(max_length=255)

class ProgramOutcome(models.Model):
    program_outcome_id = models.AutoField(primary_key=True)
    program = models.ForeignKey("Program", on_delete=models.CASCADE)
    program_outcome_description = models.CharField(max_length=255)

class BloomsClassification(models.Model):
    blooms_classification_id = models.AutoField(primary_key=True)
    blooms_classification_type = models.CharField(max_length=255)

class AssessmentCourseOutcome(models.Model):
    assessment = models.ForeignKey("Assessment", on_delete=models.CASCADE)
    course_outcome = models.ForeignKey("CourseOutcome", on_delete=models.CASCADE)

    class Meta:
        unique_together = ("assessment", "course_outcome")

class OutcomeMapping(models.Model):
    program_outcome = models.ForeignKey("ProgramOutcome", on_delete=models.CASCADE)
    course_outcome = models.ForeignKey("CourseOutcome", on_delete=models.CASCADE)
    outcome_mapping = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        unique_together = ("program_outcome", "course_outcome")
