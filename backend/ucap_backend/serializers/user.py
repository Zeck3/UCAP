from rest_framework import serializers
from ucap_backend.models import *
from django.contrib.auth.password_validation import validate_password

# ====================================================
# Login Authentication
# ====================================================
class CurrentUserSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(source="user_role.user_role_id", read_only=True)
    department_ids = serializers.PrimaryKeyRelatedField(
        source="departments", many=True, read_only=True
    )

    class Meta:
        model = User
        fields = [
            "user_id",
            "role_id",
            "department_ids",
            "first_name",
            "last_name",
            "email",
        ]

    def get_department_names(self, obj):
        return [d.department_name for d in obj.departments.all()]
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value

# ====================================================
# User Department
# ====================================================
class UserInitialInfoSerializer(serializers.ModelSerializer):
    user_role_id = serializers.SerializerMethodField()
    user_role_type = serializers.SerializerMethodField()
    user_role_scope = serializers.SerializerMethodField()
    departments = serializers.SerializerMethodField()
    leadership = serializers.SerializerMethodField()
    primary_department = serializers.SerializerMethodField()
    primary_college = serializers.SerializerMethodField()
    primary_campus = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "user_id",
            "user_role_id",
            "user_role_type",
            "user_role_scope",
            "departments",
            "leadership",
            "primary_department",
            "primary_college",
            "primary_campus",
            "first_name",
            "middle_name",
            "last_name",
            "suffix",
            "email",
        ]

    def get_departments(self, obj):
        return [
            {
                "department_id": d.department_id,
                "department_name": d.department_name,
            }
            for d in obj.departments.all()
        ]

    def get_leadership(self, obj):
        if obj.chair_department:
            d = obj.chair_department
            return {
                "level": "department",
                "id": d.department_id,
                "name": d.department_name,
            }

        if obj.dean_college:
            c = obj.dean_college
            return {
                "level": "college",
                "id": c.college_id,
                "name": c.college_name,
            }

        if obj.vcaa_campus:
            cp = obj.vcaa_campus
            return {
                "level": "campus",
                "id": cp.campus_id,
                "name": cp.campus_name,
            }

        return None
    
    def _primary_department(self, obj):
        if obj.chair_department:
            return obj.chair_department
        return obj.departments.first()

    def get_primary_department(self, obj):
        d = self._primary_department(obj)
        if not d:
            return None
        return {
            "department_id": d.department_id,
            "department_name": d.department_name,
        }

    def get_primary_college(self, obj):
        if obj.dean_college:
            c = obj.dean_college
        else:
            d = self._primary_department(obj)
            c = d.college if d else None

        if not c:
            return None
        return {
            "college_id": c.college_id,
            "college_name": c.college_name,
        }

    def get_primary_campus(self, obj):
        if obj.vcaa_campus:
            cp = obj.vcaa_campus
        else:
            if obj.dean_college:
                cp = obj.dean_college.campus
            else:
                d = self._primary_department(obj)
                cp = d.campus if d else None

        if not cp:
            return None
        return {
            "campus_id": cp.campus_id,
            "campus_name": cp.campus_name,
        }
    

    def get_user_role_id(self, obj):
        return obj.user_role.user_role_id if obj.user_role else None

    def get_user_role_type(self, obj):
        return obj.user_role.user_role_type if obj.user_role else None

    def get_user_role_scope(self, obj):
        return obj.user_role.scope if obj.user_role else None