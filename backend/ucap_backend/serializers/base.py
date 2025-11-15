from rest_framework import serializers
from ucap_backend.models import *

# ====================================================
# Reusable Serializers
# ====================================================
class BaseLoadedCourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.course_code", read_only=True)
    course_title = serializers.CharField(source="course.course_title", read_only=True)
    program_name = serializers.CharField(source="course.program.program_name", read_only=True)
    academic_year_start = serializers.IntegerField(source="academic_year.academic_year_start", read_only=True)
    academic_year_end = serializers.IntegerField(source="academic_year.academic_year_end", read_only=True)
    semester_type = serializers.CharField(source="course.semester.semester_type", read_only=True)
    year_level_type = serializers.CharField(source="course.year_level.year_level_type", read_only=True)

    class Meta:
        model = LoadedCourse
        fields = [
            "loaded_course_id",
            "course_code",
            "course_title",
            "program_name",
            "academic_year_start",
            "academic_year_end",
            "semester_type",
            "year_level_type",
        ]

class BaseSectionSerializer(serializers.ModelSerializer):
    instructor_id = serializers.IntegerField(
        source="instructor_assigned.user_id",
        read_only=True,
        allow_null=True
    )
    instructor_assigned = serializers.SerializerMethodField()

    def get_instructor_assigned(self, obj):
        ins = obj.instructor_assigned
        if ins:
            return f"{ins.first_name} {ins.last_name}".strip()
        return "NO INSTRUCTOR ASSIGNED"

    class Meta:
        model = Section
        fields = [
            "instructor_assigned",
            "instructor_id",
        ]

class BaseCourseDetailsSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="loaded_course.course.course_title", read_only=True)
    academic_year = serializers.SerializerMethodField()
    course_code = serializers.CharField(source="loaded_course.course.course_code", read_only=True)
    semester_type = serializers.CharField(source="loaded_course.course.semester.semester_type", read_only=True)
    year_level = serializers.CharField(source="loaded_course.course.year_level.year_level_type", read_only=True)
    department_name = serializers.CharField(source="loaded_course.course.program.department.department_name", read_only=True)
    college_name = serializers.CharField(source="loaded_course.course.program.department.college.college_name", read_only=True)
    campus_name = serializers.CharField(source="loaded_course.course.program.department.campus.campus_name", read_only=True)

    def get_academic_year(self, obj):
        ay = obj.loaded_course.academic_year
        return f"{ay.academic_year_start}-{ay.academic_year_end}"

    class Meta:
        model = Section
        fields = [
            "course_code",
            "course_title",
            "academic_year",
            "semester_type",
            "year_level",
            "department_name",
            "college_name",
            "campus_name",
        ]

# ====================================================
# Dropdown
# ====================================================
class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = ["user_role_id", "user_role_type"]
    def __str__(self):
        return self.name

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["department_id", "department_name"]
    def __str__(self):
        return self.name

class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ["program_id", "program_name"]

class YearLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YearLevel
        fields = ["year_level_id", "year_level_type"]

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ["semester_id", "semester_type"]

class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credit
        fields = ["credit_id", "lecture_unit", "laboratory_unit", "credit_unit"]

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ["academic_year_id", "academic_year_start", "academic_year_end"]

class InstructorSerializer(serializers.ModelSerializer):
    user_role = serializers.CharField(source="user_role.user_role_type", read_only=True)
    department_id = serializers.CharField(source="department.department_id", read_only=True)

    class Meta:
        model = User
        fields = [
            "user_id",
            "first_name",
            "last_name",
            "user_role",
            "department_id",
        ]