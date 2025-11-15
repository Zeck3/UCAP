from rest_framework import serializers
from ucap_backend.models import *
from django.contrib.auth.hashers import make_password

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
                credit = Credit.objects.create(
                    lecture_unit=lecture,
                    laboratory_unit=lab,
                    credit_unit=credit_total
                )
                instance.credit = credit
            instance.credit.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance