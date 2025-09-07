from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import check_password

class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'first_name', 'middle_name', 'last_name', 'suffix', 'email']


#============================================================================================================================

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role']  # Use 'role_type', not 'role_name'

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
    department_campus_id = CampusSerializer()
    department_college_id = CollegeSerializer()

    class Meta:
        model = Department
        fields = ['department_id', 'department_name', 'department_campus_id', 'department_college_id']

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

class CourseListSerializer(serializers.ModelSerializer):
    course_credit_id = CreditSerializer()
    course_program_id = ProgramSerializer()
    course_year_level_id = YearLevelSerializer()

    class Meta:
        model = Course
        fields = ['course_code', 'course_credit_id', 'course_program_id', 'course_year_level_id', 'course_title']

#============================================================================================================================

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
            user = User.objects.get(user_id=user_id)
            if not check_password(password, user.password):
                raise ValueError
            self.user = user
            return True
        except:
            self.errors["message"] = "Invalid user_id or password."
            return False
        
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        
class ViewCourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(read_only=True)
    course_title = serializers.CharField(read_only=True)
    department = serializers.SerializerMethodField()
    program = ProgramSerializer(source='program_id', read_only=True)
    academic_year = serializers.SerializerMethodField()
    semester = serializers.CharField(source='semester_id.semester_name', read_only=True)
    college = serializers.SerializerMethodField()
    campus = serializers.CharField(source='program_id.department_id.campus_id.campus_name', read_only=True)

    class Meta:
        model = Course
        fields = [
            'course_code',
            'course_title',
            'department',
            'program',
            'academic_year',
            'semester',
            'college',
            'campus',
        ]

    def get_college(self, obj):
        # Assumes: Course → Program → Department → College
        if obj.program_id and obj.program_id.department_id and obj.program_id.department_id.college_id:
            return obj.program_id.department_id.college_id.college_name
        return None
    
    def get_department(self, obj):
        # Assumes: Course → Program → Department
        if obj.program_id and obj.program_id.department_id:
            return obj.program_id.department_id.department_name
        return None

    def get_academic_year(self, obj):
        if obj.acad_year_id:
            return f"{obj.acad_year_id.academic_year_start}-{obj.acad_year_id.academic_year_end}"
        return None

class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = '__all__'