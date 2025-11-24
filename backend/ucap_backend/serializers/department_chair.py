from rest_framework import serializers
from ucap_backend.models import *
from .base import *

# ====================================================
# Department Chair
# ====================================================
class DepartmentCourseSerializer(serializers.ModelSerializer):
    year_level_type = serializers.CharField(source="year_level.year_level_type", read_only=True)
    semester_type = serializers.CharField(source="semester.semester_type", read_only=True)

    lecture_unit = serializers.IntegerField(source="credit.lecture_unit", read_only=True)
    laboratory_unit = serializers.IntegerField(source="credit.laboratory_unit", read_only=True)
    credit_unit = serializers.IntegerField(source="credit.credit_unit", read_only=True)

    class Meta:
        model = Course
        fields = [
            "course_code",
            "course_title",
            "year_level_type",
            "semester_type",
            "lecture_unit",
            "laboratory_unit",
            "credit_unit",
        ]

class DepartmentLoadedCourseSerializer(BaseLoadedCourseSerializer):
    pass

class CreateDepartmentLoadedCourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoadedCourse
        fields = ["course", "academic_year"]

    def validate(self, attrs):
        course = attrs.get("course")
        academic_year = attrs.get("academic_year")

        if LoadedCourse.objects.filter(course=course, academic_year=academic_year).exists():
            raise serializers.ValidationError(
                f"Course {course.course_code} is already loaded for the given academic year."
            )

        department_id = self.context.get("department_id")
        if department_id and course.program.department_id != department_id:
            raise serializers.ValidationError("Course does not belong to this department.")

        return attrs


class DepartmentChairSectionSerializer(BaseSectionSerializer):
    class Meta(BaseSectionSerializer.Meta):
        model = Section
        fields = [
            "section_id",
            "year_and_section",
            "instructor_assigned",
            "instructor_id",
        ]

class DepartmentChairCourseDetailsSerializer(BaseCourseDetailsSerializer):
    class Meta(BaseCourseDetailsSerializer.Meta):
        model = Section
        fields = BaseCourseDetailsSerializer.Meta.fields

class SectionCreateUpdateSerializer(serializers.ModelSerializer):
    instructor_assigned = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )
    loaded_course = serializers.PrimaryKeyRelatedField(
        queryset=LoadedCourse.objects.all(), required=True
    )

    class Meta:
        model = Section
        fields = ["year_and_section", "instructor_assigned", "loaded_course"]

    def validate(self, attrs):
        year_and_section = attrs.get("year_and_section")
        instructor_assigned = attrs.get("instructor_assigned")
        loaded_course = attrs.get("loaded_course")

        if not year_and_section or not loaded_course:
            raise serializers.ValidationError("Both 'year_and_section' and 'loaded_course' are required.")

        if Section.objects.filter(
            year_and_section=year_and_section,
            instructor_assigned=instructor_assigned,
            loaded_course=loaded_course
        ).exists():
            raise serializers.ValidationError("A section with these details already exists.")
        return attrs
    
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
        ]

class CreateCourseSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(queryset=Program.objects.all())
    year_level = serializers.PrimaryKeyRelatedField(queryset=YearLevel.objects.all())
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all())

    lecture_unit = serializers.IntegerField(write_only=True)
    laboratory_unit = serializers.IntegerField(write_only=True)

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
        ]

    def validate_course_code(self, value):
        if Course.objects.filter(course_code=value).exists():
            raise serializers.ValidationError("This course code already exists.")
        return value

    def validate(self, attrs):
        department_id = self.context.get("department_id")
        program = attrs.get("program")
        if department_id and program and program.department_id != department_id:
            raise serializers.ValidationError("Program does not belong to this department.")

        lecture = attrs.get("lecture_unit")
        lab = attrs.get("laboratory_unit")
        computed_total = (lecture or 0) + (lab or 0)

        provided_total = attrs.get("credit_unit")
        if provided_total is not None and provided_total != computed_total:
            raise serializers.ValidationError({
                "credit_unit": "Credit unit must be lecture_unit + laboratory_unit."
            })

        attrs["credit_unit"] = computed_total
        return attrs

    def create(self, validated_data):
        lecture = validated_data.pop("lecture_unit")
        lab = validated_data.pop("laboratory_unit")

        credit_total = validated_data.pop("credit_unit", lecture + lab)

        credit, _ = Credit.objects.get_or_create(
            lecture_unit=lecture,
            laboratory_unit=lab,
            credit_unit=credit_total
        )

        return Course.objects.create(credit=credit, **validated_data)

class UpdateCourseSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(queryset=Program.objects.all(), required=False)
    year_level = serializers.PrimaryKeyRelatedField(queryset=YearLevel.objects.all(), required=False)
    semester = serializers.PrimaryKeyRelatedField(queryset=Semester.objects.all(), required=False)

    lecture_unit = serializers.IntegerField(required=False)
    laboratory_unit = serializers.IntegerField(required=False)

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
        ]
        extra_kwargs = {"course_code": {"read_only": True}}

    def validate(self, attrs):
        department_id = self.context.get("department_id")
        program = attrs.get("program")
        if department_id and program and program.department_id != department_id:
            raise serializers.ValidationError("Program does not belong to this department.")

        current_lecture = getattr(self.instance.credit, "lecture_unit", 0) if self.instance else 0
        current_lab = getattr(self.instance.credit, "laboratory_unit", 0) if self.instance else 0

        lecture = attrs.get("lecture_unit", current_lecture)
        lab = attrs.get("laboratory_unit", current_lab)
        computed_total = lecture + lab

        provided_total = attrs.get("credit_unit")
        if provided_total is not None and provided_total != computed_total:
            raise serializers.ValidationError({
                "credit_unit": "Credit unit must be lecture_unit + laboratory_unit."
            })

        attrs["credit_unit"] = computed_total

        existing_credit = Credit.objects.filter(
            lecture_unit=lecture,
            laboratory_unit=lab,
            credit_unit=computed_total
        ).first()
        attrs["_existing_credit"] = existing_credit

        return attrs

    def update(self, instance, validated_data):
        lecture = validated_data.pop("lecture_unit", None)
        lab = validated_data.pop("laboratory_unit", None)
        credit_total = validated_data.pop("credit_unit", None)
        existing_credit = validated_data.pop("_existing_credit", None)

        if credit_total is not None:
            lecture_val = lecture if lecture is not None else instance.credit.lecture_unit
            lab_val = lab if lab is not None else instance.credit.laboratory_unit

            if existing_credit:
                instance.credit = existing_credit
            else:
                instance.credit = Credit.objects.create(
                    lecture_unit=lecture_val,
                    laboratory_unit=lab_val,
                    credit_unit=credit_total
                )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance