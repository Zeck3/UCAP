from rest_framework import serializers
from django.db.models import Prefetch
from ucap_backend.models import *
from .base import *

# ====================================================
# Instructor
# ====================================================
class InstructorLoadedCourseSerializer(BaseLoadedCourseSerializer):
    class Meta(BaseLoadedCourseSerializer.Meta):
        fields = BaseLoadedCourseSerializer.Meta.fields

class InstructorSectionSerializer(BaseSectionSerializer):
    class Meta(BaseSectionSerializer.Meta):
        model = Section
        fields = [
            "section_id",
            "year_and_section",
            "instructor_assigned",
            "instructor_id",
        ]

class InstructorCourseDetailsSerializer(BaseCourseDetailsSerializer):
    class Meta(BaseCourseDetailsSerializer.Meta):
        model = Section
        fields = BaseCourseDetailsSerializer.Meta.fields

# ====================================================
# Class Record
# ====================================================
class AssessmentSerializer(serializers.ModelSerializer):
    blooms_classification = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=BloomsClassification.objects.all(),
        required=False
    )
    course_outcome = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=CourseOutcome.objects.all(),
        required=False
    )

    class Meta:
        model = Assessment
        fields = [
            "assessment_id",
            "assessment_title",
            "assessment_highest_score",
            "course_component",
            "blooms_classification",
            "course_outcome",
        ]

class CourseComponentSerializer(serializers.ModelSerializer):
    assessments = AssessmentSerializer(source="assessment_set", many=True)

    class Meta:
        model = CourseComponent
        fields = [
            "course_component_id", 
            "course_component_type", 
            "course_component_percentage", 
            "assessments"
        ]
        read_only_fields = ["course_component_id"]
    
class CourseUnitSerializer(serializers.ModelSerializer):
    course_components = CourseComponentSerializer(source="coursecomponent_set", many=True)

    class Meta:
        model = CourseUnit
        fields = [
            "course_unit_id", 
            "course_unit_type", 
            "course_unit_percentage", 
            "course_components"
        ]
        read_only_fields = ["course_unit_id", "course_unit_type"]

class CourseTermSerializer(serializers.ModelSerializer):
    course_units = CourseUnitSerializer(source="courseunit_set", many=True)

    class Meta:
        model = CourseTerm
        fields = [
            "course_term_id", 
            "course_term_type", 
            "section_id", 
            "course_units"
        ]
        read_only_fields = ["course_term_id", "course_term_type", "section_id"]

class StudentScoreSerializer(serializers.Serializer):
    assessment_id = serializers.IntegerField()
    value = serializers.IntegerField(allow_null=True)

class StudentSerializer(serializers.ModelSerializer):
    scores = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = [
            "student_id", 
            "id_number", 
            "student_name", 
            "scores", 
            "remarks", 
            "section_id"
        ]
        read_only_fields = ["student_id", "section_id"]

    def get_scores(self, obj):
        raw_scores = obj.rawscore_set.all()
        return [
            {"assessment_id": rs.assessment.assessment_id, "value": rs.raw_score}
            for rs in raw_scores
        ]

class ClassRecordSerializer(serializers.Serializer):
    info = serializers.SerializerMethodField()
    course_terms = serializers.SerializerMethodField()
    students = serializers.SerializerMethodField()

    def get_info(self, obj):
        course = obj.loaded_course.course
        return {
            "department": course.program.department.department_name,
            "subject": course.course_title,
            "yearSection": obj.year_and_section
        }

    def get_course_terms(self, obj):
        from django.db.models import Prefetch
        terms = (
            CourseTerm.objects.filter(section=obj)
            .select_related("section")
            .prefetch_related(
                Prefetch(
                    "courseunit_set",
                    queryset=CourseUnit.objects.prefetch_related(
                        Prefetch(
                            "coursecomponent_set",
                            queryset=CourseComponent.objects.prefetch_related("assessment_set")
                        )
                    )
                )
            )
        )
        return CourseTermSerializer(terms, many=True).data

    def get_students(self, obj):
        students = (
            Student.objects.filter(section=obj)
            .select_related("section")
            .prefetch_related(
                Prefetch("rawscore_set", queryset=RawScore.objects.select_related("assessment"))
            )
        )
        return StudentSerializer(students, many=True).data
    
    def get_course_terms(self, obj):
        terms = obj.courseterm_set.all()
        return CourseTermSerializer(terms, many=True).data
    
class BloomsClassificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BloomsClassification
        fields = ["blooms_classification_id", "blooms_classification_type"]

class StudentImportSerializer(serializers.Serializer):
    file = serializers.FileField()

# ====================================================
# Course Outcome Assessment
# ====================================================
class ClassworkSerializer(serializers.Serializer):
    name = serializers.CharField()
    blooms = serializers.ListField(child=serializers.CharField())
    maxScore = serializers.IntegerField()

class CourseOutcomeDisplaySerializer(serializers.Serializer):
    name = serializers.CharField()
    classwork = ClassworkSerializer(many=True)

class ProgramOutcomeDisplaySerializer(serializers.Serializer):
    name = serializers.CharField()
    cos = CourseOutcomeDisplaySerializer(many=True)

class StudentScoreSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    scores = serializers.DictField(child=serializers.ListField())

class AssessmentPageSerializer(serializers.Serializer):
    classInfo = serializers.DictField()
    pos = ProgramOutcomeDisplaySerializer(many=True)
    students = StudentScoreSerializer(many=True)

# ====================================================
# Outcome Mapping
# ====================================================
class CourseOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseOutcome
        fields = [
            "course_outcome_id",
            "course_outcome_code",
            "course_outcome_description",
            "loaded_course",
        ]
        read_only_fields = ["course_outcome_code", "loaded_course"]

class ProgramOutcomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramOutcome
        fields = [
            "program_outcome_id",
            "program_outcome_code",
            "program_outcome_description",
            "program",
        ]
        read_only_fields = ["program"]

class OutcomeMappingSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    program_outcome = ProgramOutcomeSerializer(read_only=True)
    course_outcome = CourseOutcomeSerializer(read_only=True)
    program_outcome_id = serializers.PrimaryKeyRelatedField(
        source="program_outcome",
        queryset=ProgramOutcome.objects.all(),
        write_only=True
    )
    course_outcome_id = serializers.PrimaryKeyRelatedField(
        source="course_outcome",
        queryset=CourseOutcome.objects.all(),
        write_only=True
    )

    class Meta:
        model = OutcomeMapping
        fields = [
            "id",
            "program_outcome",
            "course_outcome",
            "program_outcome_id",
            "course_outcome_id",
            "outcome_mapping",
        ]