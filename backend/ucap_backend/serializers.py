from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password, check_password

#============================================================================================================================
class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role'] 

class CampusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campus
        fields = ['campus_name']

class CollegeSerializer(serializers.ModelSerializer):
    college_campus_id = CampusSerializer()

    class Meta:
        model = College
        fields = ['college_id', 'college_name', 'college_campus_id']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_id', 'department_name']

class ProgramSerializer(serializers.ModelSerializer):
    program_department_id = DepartmentSerializer()

    class Meta:
        model = Program
        fields = ['program_id', 'program_name', 'program_department_id']

class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = ['semester_id', 'semester_type']

class YearLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YearLevel
        fields = ['year_level_id', 'year_level']

class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['academic_year_id', 'academic_year_start', 'academic_year_end']

class CreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Credit
        fields = ['credit_id', 'lecture_unit', 'laboratory_unit', 'credit_unit']
#===== Course List Serializer =============================================================================================================
class CourseListSerializer(serializers.ModelSerializer):
    course_credit = serializers.CharField(source='course_credit_id.credit_unit', read_only=True)
    course_program = serializers.CharField(source='course_program_id.program_name', read_only=True)
    course_year_level = serializers.CharField(source='course_year_level_id.year_level', read_only=True)
    course_semester = serializers.CharField(source='course_semester_id.semester_type', read_only=True)

    class Meta:
        model = Course
        fields = ['course_code', 'course_credit', 'course_program', 'course_year_level', 'course_semester', 'course_title']
#===== Instructor Serializer =============================================================================================================
class InstructorSerializer(serializers.ModelSerializer):
    user_role = serializers.CharField(source='user_role_id.role', read_only=True)
    user_department = serializers.CharField(source='user_department_id.department_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['user_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'email', 'user_role', 'user_department']
#===== For Login Validation =============================================================================================================
class LoginValidator:
    def __init__(self, data):
        self.data = data
        self.user = None
        self.errors = {}

    def is_valid(self):
        user_id = self.data.get("user_id")
        password = self.data.get("password")

        if not user_id or not password:
            self.errors["message"] = "Both user_id and password are required."
            return False

        try:
            user_password = User.objects.get(user_id=user_id)
            if not check_password(password, user_password.password):
                raise ValueError
            self.user = user_password
            return True
        except:
            self.errors["message"] = "Invalid user_id or password."
            return False
#========================================================================================================================================
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['course_code', 'course_title']

#===== For Registration Validation =============================================================================================================        
class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

    def validate_user_id(self, value):
        if User.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("User ID already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super(UserRegisterSerializer, self).create(validated_data)
#============================================================================================================================================


#===== SECTION SERIALIZERS =============================================================================================================
class SectionCourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_code', read_only=True)
    course_title = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_title', read_only=True)
    academic_year_start = serializers.IntegerField(source='section_loaded_course_id.loaded_academic_year_id.academic_year_start', read_only=True)
    academic_year_end = serializers.IntegerField(source='section_loaded_course_id.loaded_academic_year_id.academic_year_end', read_only=True)
    semester = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_semester_id.semester_type', read_only=True)
    year_level = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_year_level_id.year_level', read_only=True)
    department = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_program_id.program_department_id.department_name', read_only=True)
    college = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_program_id.program_department_id.department_college_id.college_name', read_only=True)
    campus = serializers.CharField(source='section_loaded_course_id.loaded_course_code.course_program_id.program_department_id.department_college_id.college_campus_id.campus_name', read_only=True)    
    
    class Meta:
        model = Section
        fields = ['course_code', 'course_title', 'academic_year_start', 'academic_year_end', 'semester', 'department', 'college', 'campus', 'year_level']
#==========================================================================================================================================
class CreateSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'
#==========================================================================================================================================
class SectionSerializer(serializers.ModelSerializer):
        assigned_instructor_first_name = serializers.CharField(source='section_instructor_assigned_id.first_name', read_only=True)
        assigned_instructor_last_name = serializers.CharField(source='section_instructor_assigned_id.last_name', read_only=True)

        class Meta:
            model = Section
            fields = ['year_and_section', 'assigned_instructor_last_name', 'assigned_instructor_first_name']


#===== Loaded Course Serializer =============================================================================================================
class LoadedCourseSerializer(serializers.ModelSerializer):
    loaded_course_code = serializers.CharField(source='loaded_course_code.course_code', read_only=True)
    loaded_academic_year_start = serializers.CharField(source='loaded_academic_year_id.academic_year_start', read_only=True)
    loaded_academic_year_end = serializers.CharField(source='loaded_academic_year_id.academic_year_end', read_only=True)
    class Meta:
        model = LoadedCourseTable
        fields = ['loaded_course_id', 'loaded_course_code', 'loaded_academic_year_start', 'loaded_academic_year_end']

class DepartmentCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['course_code', 'course_title']

class DepartmentInstructorSerializer(serializers.ModelSerializer):
    assigned_department = serializers.CharField(source='user_department_id.department_name', read_only=True)
    class Meta:
        model = User
        fields = ['user_id', 'first_name', 'last_name', 'assigned_department']