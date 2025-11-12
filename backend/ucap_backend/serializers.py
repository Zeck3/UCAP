from rest_framework import serializers
from .models import *
from django.contrib.auth.hashers import make_password
from django.db.models import Prefetch
    
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
        fields = [
            "loaded_course_id", 
            "course_code", 
            "course_title", 
            "academic_year", 
            "semester_type", 
            "department_name"
        ]

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
        fields = [
            "section_id", 
            "year_and_section", 
            "instructor_assigned", 
            "course_title", 
            "semester_type", 
            "year_level", 
            "department_name", 
            "college_name", 
            "campus_name", 
            "academic_year"
        ]

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


# ====================================================    
# Department Chair Dashboard
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

class DepartmentLoadedCourseSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source="course.course_code", read_only=True)
    course_title = serializers.CharField(source="course.course_title", read_only=True)
    program_name = serializers.CharField(source="course.program.program_name", read_only=True)
    academic_year_start = serializers.IntegerField(source="academic_year.academic_year_start", read_only=True)
    academic_year_end = serializers.IntegerField(source="academic_year.academic_year_end", read_only=True)
    year_level_type = serializers.CharField(source="course.year_level.year_level_type", read_only=True)
    semester_type = serializers.CharField(source="course.semester.semester_type", read_only=True)

    class Meta:
        model = LoadedCourse
        fields = [
            "loaded_course_id",
            "course_code",
            "course_title",
            "program_name",
            "academic_year_start",
            "academic_year_end",
            "year_level_type",
            "semester_type",
        ]

class CreateDepartmentLoadedCourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = LoadedCourse
        fields = ["course", "academic_year"]

    def validate(self, attrs):
        course = attrs.get("course")
        academic_year = attrs.get("academic_year")

        if LoadedCourse.objects.filter(course=course, academic_year=academic_year).exists():
            raise serializers.ValidationError(
                "This course is already loaded for the given academic year."
            )
        return attrs

class SectionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="loaded_course.course.course_title", read_only=True)
    academic_year = serializers.SerializerMethodField()
    semester_type = serializers.CharField(source="loaded_course.course.semester.semester_type", read_only=True)
    year_level = serializers.CharField(source="loaded_course.course.year_level.year_level_type", read_only=True)
    department_name = serializers.CharField(source="loaded_course.course.program.department.department_name", read_only=True)
    college_name = serializers.CharField(source="loaded_course.course.program.department.college.college_name", read_only=True)
    campus_name = serializers.CharField(source="loaded_course.course.program.department.campus.campus_name", read_only=True)
    instructor_assigned = serializers.IntegerField(
        source="instructor_assigned.user_id", read_only=True, allow_null=True, required=False
    )
    first_name = serializers.CharField(
        source="instructor_assigned.first_name", read_only=True, allow_null=True, required=False
    )
    last_name = serializers.CharField(
        source="instructor_assigned.last_name", read_only=True, allow_null=True, required=False
    )

    class Meta:
        model = Section
        fields = [
            "section_id",
            "course_title",
            "academic_year",
            "semester_type",
            "year_level",
            "department_name",
            "college_name",
            "campus_name",
            "year_and_section",
            "instructor_assigned",
            "first_name",
            "last_name",
        ]

    def get_academic_year(self, obj):
        ay = obj.loaded_course.academic_year
        return f"{ay.academic_year_start}-{ay.academic_year_end}"
    
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
