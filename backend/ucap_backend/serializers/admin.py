from rest_framework import serializers
from ucap_backend.models import *
from django.contrib.auth.hashers import make_password

# ====================================================
# User Management
# ====================================================
class FacultySerializer(serializers.ModelSerializer):
    department_names = serializers.SerializerMethodField()
    department_ids = serializers.PrimaryKeyRelatedField(
        source="departments", many=True, read_only=True
    )
    user_role_type = serializers.SerializerMethodField()
    chair_department_name = serializers.CharField(
        source="chair_department.department_name", read_only=True
    )
    dean_college_name = serializers.CharField(
        source="dean_college.college_name", read_only=True
    )
    vcaa_campus_name = serializers.CharField(
        source="vcaa_campus.campus_name", read_only=True
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
            "user_role_type",
            "department_ids",
            "department_names",
            "chair_department",
            "chair_department_name",
            "dean_college",
            "dean_college_name",
            "vcaa_campus",
            "vcaa_campus_name",
        ]

    def get_department_names(self, obj):
        return [d.department_name for d in obj.departments.all()]

    def get_user_role_type(self, obj):
        return obj.user_role.user_role_type if obj.user_role else None

class CreateFacultySerializer(serializers.ModelSerializer):
    departments = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        many=True,
        required=False
    )
    user_role = serializers.PrimaryKeyRelatedField(
        queryset=UserRole.objects.all(), required=True
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
            "departments",

            "chair_department",
            "dean_college",
            "vcaa_campus",
        ]

    def validate_user_id(self, value):
        if User.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("User ID already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate(self, data):
        role = data.get("user_role")

        if role.user_role_type == "Department Chair":
            if not data.get("chair_department"):
                raise serializers.ValidationError(
                    {"chair_department": "Chair must specify chair_department."}
                )

        if role.user_role_type == "Dean":
            if not data.get("dean_college"):
                raise serializers.ValidationError(
                    {"dean_college": "Dean must specify dean_college."}
                )

        if role.user_role_type == "Vice Chancellor for Academic Affairs":
            if not data.get("vcaa_campus"):
                raise serializers.ValidationError(
                    {"vcaa_campus": "VCAA must specify vcaa_campus."}
                )

        return data

    def create(self, validated_data):
        departments = validated_data.pop("departments", [])

        validated_data["password"] = make_password(str(validated_data["user_id"]))

        user = User.objects.create(**validated_data)

        if departments:
            user.departments.set(departments)

        return user

class UpdateFacultySerializer(serializers.ModelSerializer):
    user_role = serializers.PrimaryKeyRelatedField(
        queryset=UserRole.objects.all(), required=False
    )
    departments = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), many=True, required=False
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
            "departments",

            "chair_department",
            "dean_college",
            "vcaa_campus",
        ]
        extra_kwargs = {"user_id": {"read_only": True}}

    def _unassign_sections_outside_departments(self, user: User):
        allowed_dept_ids = set(
            user.departments.values_list("department_id", flat=True)
        )

        qs = Section.objects.filter(instructor_assigned=user)

        if allowed_dept_ids:
            qs = qs.exclude(
                loaded_course__course__program__department_id__in=allowed_dept_ids
            )

        qs.update(instructor_assigned=None)

    def validate(self, data):
        role = data.get("user_role", self.instance.user_role)

        if role.user_role_type == "Department Chair":
            if not data.get("chair_department") and not self.instance.chair_department:
                raise serializers.ValidationError(
                    {"chair_department": "Chair must specify chair_department."}
                )

        if role.user_role_type == "Dean":
            if not data.get("dean_college") and not self.instance.dean_college:
                raise serializers.ValidationError(
                    {"dean_college": "Dean must specify dean_college."}
                )

        if role.user_role_type == "Vice Chancellor for Academic Affairs":
            if not data.get("vcaa_campus") and not self.instance.vcaa_campus:
                raise serializers.ValidationError(
                    {"vcaa_campus": "VCAA must specify vcaa_campus."}
                )

        return data

    def update(self, instance, validated_data):
        departments = validated_data.pop("departments", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if departments is not None:
            instance.departments.set(departments)
            self._unassign_sections_outside_departments(instance)

        return instance