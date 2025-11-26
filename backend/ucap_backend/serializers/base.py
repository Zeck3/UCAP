from rest_framework import serializers
from ucap_backend.models import AcademicYear, Campus, College, Credit, Department, LoadedCourse, Program, Section, Semester, User, UserRole, YearLevel

# ====================================================
# Reusable Serializers
# ====================================================
class BaseLoadedCourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.course_code", read_only=True)
    course_title = serializers.CharField(source="course.course_title", read_only=True)
    academic_year_start = serializers.IntegerField(source="academic_year.academic_year_start", read_only=True)
    academic_year_end = serializers.IntegerField(source="academic_year.academic_year_end", read_only=True)
    semester_type = serializers.CharField(source="course.semester.semester_type", read_only=True)
    year_level_type = serializers.CharField(source="course.year_level.year_level_type", read_only=True)
    program_id = serializers.IntegerField(source="course.program.program_id", read_only=True)
    program_name = serializers.CharField(source="course.program.program_name", read_only=True)

    class Meta:
        model = LoadedCourse
        fields = [
            "loaded_course_id",
            "course_code",
            "course_title",
            "program_id",
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
    program_id = serializers.IntegerField(
        source="loaded_course.course.program.program_id", read_only=True
    )
    program_name = serializers.CharField(
        source="loaded_course.course.program.program_name", read_only=True
    )

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
            "program_id",
            "program_name",
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

class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = ["campus_id", "campus_name"]

class CollegeSerializer(serializers.ModelSerializer):
    campus_id = serializers.IntegerField(source="campus.campus_id", read_only=True)
    campus_name = serializers.CharField(source="campus.campus_name", read_only=True)
    campus = serializers.PrimaryKeyRelatedField(
        queryset=Campus.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = College
        fields = ["college_id", "college_name", "campus", "campus_id", "campus_name"]

    def validate(self, attrs):
        if not attrs.get("campus"):
            first = Campus.objects.first()
            if not first:
                raise serializers.ValidationError({"campus": "No campus exists yet."})
            attrs["campus"] = first
        return attrs


class DepartmentSerializer(serializers.ModelSerializer):
    campus_id = serializers.IntegerField(source="campus.campus_id", read_only=True)
    campus_name = serializers.CharField(source="campus.campus_name", read_only=True)
    college_id = serializers.IntegerField(source="college.college_id", read_only=True, allow_null=True)
    college_name = serializers.CharField(source="college.college_name", read_only=True, allow_null=True)

    campus = serializers.PrimaryKeyRelatedField(
        queryset=Campus.objects.all(), write_only=True, required=False
    )
    college = serializers.PrimaryKeyRelatedField(
        queryset=College.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Department
        fields = [
            "department_id", "department_name",
            "campus", "campus_id", "campus_name",
            "college", "college_id", "college_name",
        ]

    def validate(self, attrs):
        if not attrs.get("campus"):
            first = Campus.objects.first()
            if not first:
                raise serializers.ValidationError({"campus": "No campus exists yet."})
            attrs["campus"] = first
        return attrs


class ProgramSerializer(serializers.ModelSerializer):
    department_id = serializers.IntegerField(source="department.department_id", read_only=True)
    department_name = serializers.CharField(source="department.department_name", read_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), write_only=True
    )

    class Meta:
        model = Program
        fields = [
            "program_id", "program_name",
            "department", "department_id", "department_name",
        ]

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
    department_ids = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id",
            "first_name",
            "last_name",
            "user_role",
            "department_ids",
        ]

    def get_department_ids(self, obj):
        return list(obj.departments.values_list("department_id", flat=True))