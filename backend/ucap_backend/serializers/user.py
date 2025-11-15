from rest_framework import serializers
from ucap_backend.models import *

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
# User Department
# ====================================================
class UserDepartmentSerializer(serializers.ModelSerializer):
    college_id = serializers.IntegerField(source="college.college_id", read_only=True)
    college_name = serializers.CharField(source="college.college_name", read_only=True)
    campus_id = serializers.IntegerField(source="campus.campus_id", read_only=True)
    campus_name = serializers.CharField(source="campus.campus_name", read_only=True)
    program_id = serializers.SerializerMethodField()
    program_name = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = [
            "department_id",
            "department_name",
            "college_id",
            "college_name",
            "campus_id",
            "campus_name",
            "program_id",
            "program_name",
        ]

    def get_program_id(self, obj):
        program = obj.program_set.first()
        return program.program_id if program else None

    def get_program_name(self, obj):
        program = obj.program_set.first()
        return program.program_name if program else None
