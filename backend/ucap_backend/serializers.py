from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password, check_password
    
# ====================================================
# Login Authentication
# ====================================================
class CurrentUserSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(source="user_role.user_role_id", read_only=True)
    department_id = serializers.IntegerField(source="department.department_id", read_only=True)

    class Meta:
        model = User
        fields = [
            "user_id",
            "role_id",
            "department_id",
            "first_name",
            "last_name",
            "email",
        ]

# ====================================================
# User Management
# ====================================================
class FacultySerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()
    user_role_type = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id",
            "first_name",
            "middle_name",
            "last_name",
            "suffix",
            "email",
            "department_id",
            "department_name",
            "user_role_id",
            "user_role_type",
        ]

    def get_department_name(self, obj):
        return obj.department.department_name if obj.department else None

    def get_user_role_type(self, obj):
        return obj.user_role.user_role_type if obj.user_role else None



class CreateFacultySerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=True, allow_null=False
    )
    user_role = serializers.PrimaryKeyRelatedField(
        queryset=UserRole.objects.all(), required=True, allow_null=False
    )
    department_name = serializers.SerializerMethodField()
    user_role_type = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id",
            "first_name",
            "middle_name",
            "last_name",
            "suffix",
            "email",
            "department",
            "department_name",
            "user_role",
            "user_role_type",
        ]
    def get_department_name(self, obj):
        return obj.department.department_name if obj.department else None

    def get_user_role_type(self, obj):
        return obj.user_role.user_role_type if obj.user_role else None

    def validate_user_id(self, value):
        if User.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("User ID already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        validated_data["password"] = make_password(str(validated_data["user_id"]))
        return super().create(validated_data)

class UpdateFacultySerializer(serializers.ModelSerializer):
    user_role = serializers.PrimaryKeyRelatedField(
        queryset=UserRole.objects.all(), required=False, allow_null=True
    )
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "user_id",
            "first_name",
            "middle_name",
            "last_name",
            "suffix",
            "email",
            "user_role",
            "department",
        ]
        extra_kwargs = {
            "user_id": {"read_only": True},
        }

    def update(self, instance, validated_data):
        validated_data.pop("password", None)
        return super().update(instance, validated_data)

# ====================================================
# Course Management
# ====================================================
class CourseSerializer(serializers.ModelSerializer):
    program_id = serializers.IntegerField(source="program.program_id", read_only=True)
    program_name = serializers.CharField(source="program.program_name", read_only=True)
    semester_id = serializers.IntegerField(source="semester.semester_id", read_only=True)
    semester_type = serializers.CharField(source="semester.semester_type", read_only=True)
    year_level_id = serializers.IntegerField(source="year_level.year_level_id", read_only=True)
    year_level_type = serializers.CharField(source="year_level.year_level_type", read_only=True)
    credit_id = serializers.IntegerField(source="credit.credit_id", read_only=True)
    lecture_unit = serializers.IntegerField(source="credit.lecture_unit", read_only=True)
    laboratory_unit = serializers.IntegerField(source="credit.laboratory_unit", read_only=True)
    credit_unit = serializers.IntegerField(source="credit.credit_unit", read_only=True)

    class Meta:
        model = Course
        fields = [
            "course_code",
            "course_title",
            "program_id",
            "program_name",
            "semester_id",
            "semester_type",
            "year_level_id",
            "year_level_type",
            "credit_id",
            "lecture_unit",
            "laboratory_unit",
            "credit_unit",
        ]

class CreateCourseSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(queryset=Program.objects.all())
    year_level = serializers.PrimaryKeyRelatedField(queryset=YearLevel.objects.all())
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all())

    lecture_unit = serializers.IntegerField(write_only=True)
    laboratory_unit = serializers.IntegerField(write_only=True)
    credit_unit = serializers.IntegerField(write_only=True)

    class Meta:
        model = Course
        fields = [
            "course_code",
            "course_title",
            "program",
            "year_level",
            "semester",
            "lecture_unit",
            "laboratory_unit",
            "credit_unit",
        ]
    
    def validate_course_code(self, value):
        if Course.objects.filter(course_code=value).exists():
            raise serializers.ValidationError("This course code already exists.")
        return value

    def create(self, validated_data):
        lecture = validated_data.pop("lecture_unit")
        lab = validated_data.pop("laboratory_unit")
        credit_total = validated_data.pop("credit_unit")

        credit, created = Credit.objects.get_or_create(
            lecture_unit=lecture,
            laboratory_unit=lab,
            credit_unit=credit_total
        )

        course = Course.objects.create(credit=credit, **validated_data)
        return course

class UpdateCourseSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(queryset=Program.objects.all(), required=False)
    year_level = serializers.PrimaryKeyRelatedField(queryset=YearLevel.objects.all(), required=False)
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), required=False)

    lecture_unit = serializers.IntegerField(required=False)
    laboratory_unit = serializers.IntegerField(required=False)
    credit_unit = serializers.IntegerField(required=False)

    class Meta:
        model = Course
        fields = [
            "course_code",
            "course_title",
            "program",
            "year_level",
            "semester",
            "lecture_unit",
            "laboratory_unit",
            "credit_unit",
        ]
        extra_kwargs = {"course_code": {"read_only": True}}

    def validate(self, attrs):
        lecture = attrs.get("lecture_unit")
        lab = attrs.get("laboratory_unit")
        credit_total = attrs.get("credit_unit")

        if lecture is not None and lab is not None and credit_total is not None:
            existing_credit = Credit.objects.filter(
                lecture_unit=lecture,
                laboratory_unit=lab,
                credit_unit=credit_total
            ).first()
            attrs["_existing_credit"] = existing_credit
        return attrs

    def update(self, instance, validated_data):
        lecture = validated_data.pop("lecture_unit", None)
        lab = validated_data.pop("laboratory_unit", None)
        credit_total = validated_data.pop("credit_unit", None)

        existing_credit = validated_data.pop("_existing_credit", None)

        if lecture is not None and lab is not None and credit_total is not None:
            if existing_credit:
                instance.credit = existing_credit
            else:
                # create new Credit
                credit = Credit.objects.create(
                    lecture_unit=lecture,
                    laboratory_unit=lab,
                    credit_unit=credit_total
                )
                instance.credit = credit
            instance.credit.save()

        # Update remaining fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
    
# ====================================================
# Instructor Dashboard
# ====================================================

class InstructorLoadedCourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="loaded_course.course.course_code", read_only=True)
    course_title = serializers.CharField(source="loaded_course.course.course_title", read_only=True)
    academic_year = serializers.SerializerMethodField()
    semester_type = serializers.CharField(source="loaded_course.course.semester.semester_type", read_only=True)
    department_name = serializers.CharField(source="loaded_course.course.program.department.department_name", read_only=True)

    def get_academic_year(self, obj):
        return str(obj.loaded_course.academic_year.academic_year_start) + "-" + str(obj.loaded_course.academic_year.academic_year_end)
    class Meta:
        model = Section
        fields = ["loaded_course_id", "course_code", "course_title", "academic_year", "semester_type", "department_name"]

class InstructorAssignedSectionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="loaded_course.course.course_title", read_only=True)
    semester_type = serializers.CharField(source="loaded_course.course.semester.semester_type", read_only=True)
    year_level = serializers.CharField(source="loaded_course.course.year_level.year_level_type", read_only=True)    
    department_name = serializers.CharField(source="loaded_course.course.program.department.department_name", read_only=True)
    college_name = serializers.CharField(source="loaded_course.course.program.department.college.college_name", read_only=True)
    campus_name = serializers.CharField(source="loaded_course.course.program.department.campus.campus_name", read_only=True)
    academic_year = serializers.SerializerMethodField()
    instructor_assigned = serializers.SerializerMethodField()
    
    def get_instructor_assigned(self, obj):
        if obj.instructor_assigned:
            return obj.instructor_assigned.first_name + " " + obj.instructor_assigned.last_name
        else:
            return None
    def get_academic_year(self, obj):
        return str(obj.loaded_course.academic_year.academic_year_start) + "-" + str(obj.loaded_course.academic_year.academic_year_end)

    class Meta:
        model = Section
        fields = ["section_id", "year_and_section", "instructor_assigned", "course_title", "semester_type", "year_level", "department_name", "college_name", "campus_name", "academic_year"]

# ====================================================
# Department Chair Dashboard
# ====================================================
class DepartmentDetailsSerializer(serializers.ModelSerializer):
    campus_name = serializers.CharField(source="college.campus.campus_name", read_only=True)
    college_name = serializers.CharField(source="college.college_name", read_only=True)
    class Meta:
        model = Department
        fields = ["department_name", "campus_name", "college_name"]
 
class DepartmentLoadedCoursesSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.course_code", read_only=True)
    course_title = serializers.CharField(source="course.course_title", read_only=True)
    program_name = serializers.CharField(source="course.program.program_name", read_only=True)
    year_level = serializers.CharField(source="course.year_level.year_level_type", read_only=True)
    semester_type = serializers.CharField(source="course.semester.semester_type", read_only=True)
    year_level = serializers.CharField(source="course.year_level.year_level_type", read_only=True)
    department_name = serializers.CharField(source="course.program.department.department_name", read_only=True)
    academic_year_start = serializers.IntegerField(source="academic_year.academic_year_start", read_only=True)
    academic_year_end = serializers.IntegerField(source="academic_year.academic_year_end", read_only=True)
    class Meta:
        model = LoadedCourse
        fields = ["loaded_course_id", "course_code", "course_title", "program_name", "year_level", "semester_type", "department_name", "academic_year_start", "academic_year_end"]

class DepartmentLoadedCourseDetailsSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.course_title", read_only=True)
    semester_type = serializers.CharField(source="course.semester.semester_type", read_only=True)
    year_level = serializers.CharField(source="course.year_level.year_level_type", read_only=True)    
    department_name = serializers.CharField(source="course.program.department.department_name", read_only=True)
    college_name = serializers.CharField(source="course.program.department.college.college_name", read_only=True)
    campus_name = serializers.CharField(source="course.program.department.campus.campus_name", read_only=True)
    academic_year_start = serializers.IntegerField(source="academic_year.academic_year_start", read_only=True)
    academic_year_end = serializers.IntegerField(source="academic_year.academic_year_end", read_only=True)
    class Meta:
        model = LoadedCourse
        fields = ["loaded_course_id", "course_title", "semester_type", "year_level", "department_name", "college_name", "campus_name", "academic_year_start", "academic_year_end"]

class DepartmentChairSectionSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="instructor_assigned.first_name", read_only=True)
    last_name = serializers.CharField(source="instructor_assigned.last_name", read_only=True)
    class Meta:
        model = Section
        fields = ["section_id", "year_and_section", "first_name", "last_name"]

class DepartmentNotLoadedCoursesSerializer(serializers.ModelSerializer):
    lecture_unit = serializers.IntegerField(source="credit.lecture_unit", read_only=True)
    lab_unit = serializers.IntegerField(source="credit.laboratory_unit", read_only=True)
    credit_unit = serializers.IntegerField(source="credit.credit_unit", read_only=True)
    class Meta:
        model = Course
        fields = ["course_code", "course_title", "lecture_unit", "lab_unit", "credit_unit"]

class LoadDepartmentCourseSerializer(serializers.ModelSerializer):
    academic_year = serializers.PrimaryKeyRelatedField(queryset=AcademicYear.objects.all(), required=True)
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all(), required=True)
    class Meta:
        model = LoadedCourse
        fields = ["loaded_course_id", "academic_year", "course"]

    # def validate(self, data):
    #     course = data.get("course")
    #     academic_year = data.get("academic_year")
    #     if LoadedCourse.objects.filter(course=course, academic_year=academic_year).exists():
    #         raise serializers.ValidationError("Course already loaded for this academic year.")
    #     if not course or not academic_year:
    #         raise serializers.ValidationError("Course and academic year are required.")
    #     return data
    
    # def create(self, validated_data):
    #     # You can add extra logic here if needed before saving
    #     return super().create(validated_data)
    

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
# ====================================================
# Department Path
# ====================================================
class DepartmentPathSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.department_name", read_only=True)
    class Meta:
        model = User
        fields = ["department_name"]

# # ===== INSTRUCTOR SERIALIZERS =============================================================================================================
# class InstructorSerializer(serializers.ModelSerializer):
#     user_role = serializers.CharField(source="user_role.user_role_type", read_only=True)
#     user_department = serializers.CharField(source="department.department_name", read_only=True)

#     class Meta:
#         model = User
#         fields = [
#             "user_id",
#             "first_name",
#             "middle_name",
#             "last_name",
#             "suffix",
#             "email",
#             "user_role",
#             "user_department",
#         ]
    
# #===== SECTION SERIALIZERS ==============================================================================================================
# class InstructorCoursesSerializer(serializers.ModelSerializer):
#     course_code = serializers.CharField(source="loaded_course.course.course_code", read_only=True)
#     course_title = serializers.CharField(source="loaded_course.course.course_title", read_only=True)
#     academic_year = serializers.SerializerMethodField()
#     semester_type = serializers.CharField(source="loaded_course.course.semester.semester_type", read_only=True)
#     department_name = serializers.CharField(source="loaded_course.course.program.department.department_name", read_only=True)

#     def get_academic_year(self, obj):
#         return str(obj.loaded_course.academic_year.academic_year_start) + "-" + str(obj.loaded_course.academic_year.academic_year_end)
    
#     class Meta:
#         model = Section
#         fields = ['section_id', 'course_code', 'course_title', 'academic_year', 'semester_type', 'department_name']

# class CreateSectionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Section
#         fields = "__all__"


# # ==========================================================================================================================================



# # ===== For Registration Validation =============================================================================================================
# class UserRegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = "__all__"

#     def validate_user_id(self, value):
#         if User.objects.filter(user_id=value).exists():
#             raise serializers.ValidationError("User ID already exists.")
#         return value

#     def validate_email(self, value):
#         if User.objects.filter(email=value).exists():
#             raise serializers.ValidationError("Email already exists.")
#         return value

#     def create(self, validated_data):
#         validated_data["password"] = make_password(validated_data["password"])
#         return super(UserRegisterSerializer, self).create(validated_data)


# # ===== Loaded Course Serializer =============================================================================================================
# class LoadedCourseSerializer(serializers.ModelSerializer):
#     loaded_course_code = serializers.CharField(
#         source="loaded_course_code.course_code", read_only=True
#     )
#     loaded_academic_year_start = serializers.CharField(
#         source="loaded_academic_year_id.academic_year_start", read_only=True
#     )
#     loaded_academic_year_end = serializers.CharField(
#         source="loaded_academic_year_id.academic_year_end", read_only=True
#     )

#     class Meta:
#         model = LoadedCourse
#         fields = [
#             "loaded_course_id",
#             "loaded_course_code",
#             "loaded_academic_year_start",
#             "loaded_academic_year_end",
#         ]


# class DepartmentInstructorSerializer(serializers.ModelSerializer):
#     assigned_department = serializers.CharField(
#         source="user_department_id.department_name", read_only=True
#     )

#     class Meta:
#         model = User
#         fields = ["user_id", "first_name", "last_name", "assigned_department"]
