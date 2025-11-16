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
