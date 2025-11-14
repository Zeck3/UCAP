from collections import defaultdict
from django.http import JsonResponse
from .models import *
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status, viewsets
from .serializers import *
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.decorators import action

# ====================================================
# Login Authentication
# ====================================================
@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token_view(request):
    return JsonResponse({"detail": "CSRF cookie set"})

@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    user_id = request.data.get("user_id")
    password = request.data.get("password")

    user = authenticate(request, username=user_id, password=password)
    if user is not None:
        login(request, user)
        return Response({"message": "Login successful"}, status=status.HTTP_200_OK)
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([AllowAny])
def me_view(request):
    if not request.user.is_authenticated:
        return Response(None, status=status.HTTP_200_OK)
    serializer = CurrentUserSerializer(request.user)
    return Response(serializer.data)

@api_view(["GET"])
@permission_classes([AllowAny])
def heartbeat_view(request):
    return Response({"detail": "alive"})

# ====================================================
# User Management
# ====================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def user_management_view(request):
    if request.method == "GET":
        try:
            faculty_excluded = User.objects.exclude(user_role_id=1)
            serializer = FacultySerializer(faculty_excluded, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({"message": "Validation failed", "errors": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "POST":
        try:
            payload = request.data
            print("POST payload:", payload)
            
            serializer = CreateFacultySerializer(data=payload)
            if serializer.is_valid():
                user = serializer.save()
                print("Created user:", user)
                return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
            else:
                print("Serializer errors:", serializer.errors)
                return JsonResponse(
                    {"message": "Validation failed", "errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print("Exception:", str(e))
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def user_detail_view(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    if request.method == "GET":
        serializer = FacultySerializer(user)
        return JsonResponse(serializer.data, safe=False)
    
    elif request.method in ["PUT", "PATCH"]:
        try:
            data = json.loads(request.body)
            serializer = UpdateFacultySerializer(
                user,
                data=data,
                partial=(request.method == "PATCH")
            )
            if serializer.is_valid():
                user = serializer.save()
                return JsonResponse(FacultySerializer(user).data, status=status.HTTP_200_OK)
            else:
                return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    elif request.method == "DELETE":
        try:
            user.delete()
            return JsonResponse({"message": "User deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
# ====================================================
# Course Management
# ====================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_management_view(request):
    try:
        if request.method == "GET":
            courses = Course.objects.all()
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "POST":
            serializer = CreateCourseSerializer(data=request.data)
            if serializer.is_valid():
                course = serializer.save()
                return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def course_detail_view(request, course_code):
    try:
        course = Course.objects.get(course_code=course_code)
    except Course.DoesNotExist:
        return Response({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if request.method == "GET":
        serializer = CourseSerializer(course)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method in ["PUT", "PATCH"]:
        try:
            data = json.loads(request.body)
            serializer = UpdateCourseSerializer(course, data=data, partial=(request.method == "PATCH"))
            if serializer.is_valid():
                serializer.save()
                updated_course = CourseSerializer(course).data
                return Response(updated_course, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == "DELETE":
        try:
            course.delete()
            return Response({"message": "Course deleted successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Instructor Dashboard
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_loaded_courses_view(request, instructor_id):
    try:
        assigned_course = Section.objects.filter(instructor_assigned=instructor_id)

        seen = set()
        unique_courses = []
        for sec in assigned_course.select_related("loaded_course__course"):
            course = sec.loaded_course.course
            if course.pk not in seen:
                seen.add(course.pk)
                unique_courses.append(sec)

        serializer = InstructorLoadedCourseSerializer(unique_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)
  
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_assigned_sections_view(request, instructor_id, loaded_course_id):
    try:
        sections = Section.objects.filter(
            instructor_assigned=instructor_id,
            loaded_course=loaded_course_id
        )

        if not sections.exists():
            return Response({
                "course_details": None,
                "sections": []
            }, status=status.HTTP_200_OK)

        first_section = sections.first()
        course = first_section.loaded_course.course

        course_details = {
            "course_code": course.course_code,  # <<< FIX ADDED HERE
            "course_title": course.course_title,
            "semester_type": course.semester.semester_type,
            "year_level": course.year_level.year_level_type,
            "department_name": course.program.department.department_name,
            "college_name": course.program.department.college.college_name,
            "campus_name": course.program.department.campus.campus_name,
            "academic_year": (
                f"{first_section.loaded_course.academic_year.academic_year_start}-"
                f"{first_section.loaded_course.academic_year.academic_year_end}"
            )
        }

        sections_payload = [
            {
                "section_id": sec.section_id,
                "year_and_section": sec.year_and_section,
                "instructor_assigned": (
                    f"{sec.instructor_assigned.first_name} {sec.instructor_assigned.last_name}"
                    if sec.instructor_assigned else None
                )
            }
            for sec in sections
        ]

        return Response({
            "course_details": course_details,
            "sections": sections_payload
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

    
# ====================================================
# Class Record
# ====================================================
class ClassRecordViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        try:
            section = (
                Section.objects
                .select_related(
                    "loaded_course__course__program__department"
                )
                .prefetch_related(
                    Prefetch(
                        "courseterm_set",
                        queryset=CourseTerm.objects.prefetch_related(
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
                    ),
                    Prefetch(
                        "student_set",
                        queryset=Student.objects.prefetch_related(
                            Prefetch("rawscore_set", queryset=RawScore.objects.select_related("assessment"))
                        )
                    )
                )
                .get(pk=pk)
            )
        except Section.DoesNotExist:
            return Response({"detail": "Section not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClassRecordSerializer(section)
        return Response(serializer.data)

class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        section_id = self.request.query_params.get("section")
        qs = self.queryset.select_related("section")
        if section_id:
            return qs.filter(section_id=section_id)
        return qs

class AssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        qs = self.queryset.select_related("course_component")
        component_id = self.request.query_params.get("component")
        if component_id:
            return qs.filter(course_component_id=component_id)
        return qs
    
class CourseComponentViewSet(viewsets.ModelViewSet):
    queryset = CourseComponent.objects.all()
    serializer_class = CourseComponentSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete a course component"}, status=status.HTTP_403_FORBIDDEN)
    
class CourseUnitViewSet(viewsets.ModelViewSet):
    queryset = CourseUnit.objects.all()
    serializer_class = CourseUnitSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete a course unit"}, status=status.HTTP_403_FORBIDDEN)

class RawScoreUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, student_id, assessment_id):
        try:
            rawscore = RawScore.objects.get(student_id=student_id, assessment_id=assessment_id)
        except RawScore.DoesNotExist:
            return Response({"detail": "RawScore not found"}, status=status.HTTP_404_NOT_FOUND)
        
        value = request.data.get("value")
        rawscore.raw_score = value
        rawscore.save()
        return Response({"student_id": student_id, "assessment_id": assessment_id, "value": value})
    
# ====================================================
# Department Chair Dashboard
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def department_course_list_view(request, department_id):
    try:
        courses = Course.objects.filter(program__department__department_id=department_id)
        serializer = DepartmentCourseSerializer(courses, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def department_course_management_view(request, department_id):
    try:
        if request.method == "GET":
            courses = LoadedCourse.objects.filter(course__program__department__department_id=department_id)
            serializer = DepartmentLoadedCourseSerializer(courses, many=True)
            return JsonResponse(serializer.data, safe=False)

        elif request.method == "POST":
            serializer = CreateDepartmentLoadedCourseSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({"message": "Course loaded successfully", "data": serializer.data}, status=status.HTTP_200_OK)
            return JsonResponse({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def department_course_detail_view(request, loaded_course_id):
    try:
        course = LoadedCourse.objects.get(loaded_course_id=loaded_course_id)
        course.delete()
        return JsonResponse({"message": "Course deleted successfully"}, status=status.HTTP_200_OK)

    except LoadedCourse.DoesNotExist:
        return JsonResponse({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def department_section_management_view(request, loaded_course_id):
    try:
        # ----------------------------
        # Always fetch course metadata
        # ----------------------------
        loaded_course = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college__campus",
                "course__semester",
                "course__year_level",
                "academic_year",
            )
            .get(pk=loaded_course_id)
        )

        course_data = {
            "course_code": loaded_course.course.course_code,
            "course_title": loaded_course.course.course_title,
            "academic_year": f"{loaded_course.academic_year.academic_year_start}-{loaded_course.academic_year.academic_year_end}",
            "semester_type": loaded_course.course.semester.semester_type,
            "year_level": loaded_course.course.year_level.year_level_type,
            "department_name": loaded_course.course.program.department.department_name,
            "college_name": loaded_course.course.program.department.college.college_name,
            "campus_name": loaded_course.course.program.department.campus.campus_name,
        }

        if request.method == "GET":
            sections = (
                Section.objects
                .select_related(
                    "loaded_course__course__program__department__college__campus",
                    "loaded_course__course__semester",
                    "loaded_course__course__year_level",
                    "loaded_course__academic_year",
                    "instructor_assigned",
                )
                .filter(loaded_course_id=loaded_course_id)
            )
            serializer = SectionSerializer(sections, many=True)
            section_data = [
                {
                    "id": s["section_id"],
                    "year_and_section": s["year_and_section"],
                    "instructor_assigned": (
                        f"{(s['first_name'] or '').strip()} {(s['last_name'] or '').strip()}".strip()
                        if s["first_name"] or s["last_name"]
                        else "NO INSTRUCTOR ASSIGNED"
                    ),
                    "instructor_id": s["instructor_assigned"],  # add this
                }
                for s in serializer.data
            ]
            return JsonResponse({"course_details": course_data, "sections": section_data}, status=status.HTTP_200_OK)


        elif request.method == "POST":
            serializer = SectionCreateUpdateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({"message": "Section created successfully"}, status=status.HTTP_201_CREATED)
            return JsonResponse({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except LoadedCourse.DoesNotExist:
        return JsonResponse({"message": "Loaded course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def department_section_detail_view(request, section_id):
    try:
        section = Section.objects.get(pk=section_id)

        if request.method in ["PUT", "PATCH"]:
            serializer = SectionCreateUpdateSerializer(instance=section, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({"message": "Section updated successfully"}, status=status.HTTP_200_OK)
            return JsonResponse({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "DELETE":
            section.delete()
            return JsonResponse({"message": "Section deleted successfully"}, status=status.HTTP_200_OK)

    except Section.DoesNotExist:
        return JsonResponse({"message": "Section not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def program_outcome_list_create_view(request, program_id):
    try:
        if request.method == "GET":
            outcomes = ProgramOutcome.objects.filter(program_id=program_id).order_by("program_outcome_id")
            serializer = ProgramOutcomeSerializer(outcomes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "POST":
            try:
                program = Program.objects.get(pk=program_id)
            except Program.DoesNotExist:
                return Response({"message": "Program not found"}, status=status.HTTP_404_NOT_FOUND)

            last_outcome = (
                ProgramOutcome.objects.filter(program=program)
                .order_by("program_outcome_id")
                .last()
            )
            if last_outcome:
                last_letter = last_outcome.program_outcome_code.split("-")[-1]
                next_letter = chr(ord(last_letter.lower()) + 1)
            else:
                next_letter = "a"

            next_code = f"PO-{next_letter}"

            serializer = ProgramOutcomeSerializer(
                data={
                    "program_outcome_code": next_code,
                    "program_outcome_description": request.data.get("program_outcome_description", ""),
                }
            )

            if serializer.is_valid():
                serializer.save(program=program)
                return Response(
                    {"message": "Program Outcome added successfully", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def program_outcome_detail_view(request, outcome_id):
    """
    PUT: Update description only.
    DELETE: Only delete the latest Program Outcome.
    """
    try:
        outcome = ProgramOutcome.objects.get(pk=outcome_id)

        if request.method == "PUT":
            serializer = ProgramOutcomeSerializer(outcome, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Program Outcome updated", "data": serializer.data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "DELETE":
            latest = (
                ProgramOutcome.objects.filter(program=outcome.program)
                .order_by("program_outcome_id")
                .last()
            )
            if latest.program_outcome_id != outcome.program_outcome_id:
                return Response(
                    {"message": "Only the most recent Program Outcome can be deleted."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            outcome.delete()
            return Response({"message": "Program Outcome deleted successfully"}, status=status.HTTP_200_OK)

    except ProgramOutcome.DoesNotExist:
        return Response({"message": "Program Outcome not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_outcome_list_create_view(request, loaded_course_id):
    """
    GET: List all Course Outcomes for a given loaded course.
    POST: Add new Course Outcome (auto-increment CO1, CO2, ...).
    """
    try:
        if request.method == "GET":
            outcomes = CourseOutcome.objects.filter(loaded_course_id=loaded_course_id).order_by("course_outcome_id")
            serializer = CourseOutcomeSerializer(outcomes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "POST":
            try:
                loaded_course = LoadedCourse.objects.get(pk=loaded_course_id)
            except LoadedCourse.DoesNotExist:
                return Response({"message": "Loaded course not found"}, status=status.HTTP_404_NOT_FOUND)

            last_outcome = (
                CourseOutcome.objects.filter(loaded_course=loaded_course)
                .order_by("course_outcome_id")
                .last()
            )

            if last_outcome:
                last_num = int(last_outcome.course_outcome_code.replace("CO", ""))
                next_num = last_num + 1
            else:
                next_num = 1

            next_code = f"CO{next_num}"

            serializer = CourseOutcomeSerializer(data=request.data)
            if serializer.is_valid():
                # supply loaded_course explicitly here
                serializer.save(loaded_course=loaded_course, course_outcome_code=next_code)
                return Response(
                    {"message": "Course Outcome added successfully", "data": serializer.data},
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def course_outcome_detail_view(request, outcome_id):
    """
    PUT: Edit course_outcome_description.
    DELETE: Remove only the latest Course Outcome.
    """
    try:
        try:
            outcome = CourseOutcome.objects.get(pk=outcome_id)
        except CourseOutcome.DoesNotExist:
            return Response({"message": "Course Outcome not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "PUT":
            serializer = CourseOutcomeSerializer(outcome, data=request.data, partial=True)
            if serializer.is_valid():
                # prevent updates to loaded_course or code
                serializer.save()
                return Response(
                    {"message": "Course Outcome updated successfully", "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == "DELETE":
            latest = (
                CourseOutcome.objects.filter(loaded_course=outcome.loaded_course)
                .order_by("course_outcome_id")
                .last()
            )
            if latest and latest.pk == outcome.pk:
                outcome.delete()
                return Response({"message": "Course Outcome deleted successfully"}, status=status.HTTP_200_OK)
            return Response(
                {"message": "Only the latest Course Outcome can be deleted"},
                status=status.HTTP_403_FORBIDDEN,
            )

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def outcome_mapping_view(request, loaded_course_id):
    """
    Returns program outcomes, course outcomes, and outcome mappings for a loaded course.
    Handles cases where either COs or POs may be missing.
    """
    try:
        course_outcomes = CourseOutcome.objects.filter(loaded_course_id=loaded_course_id)
        if not course_outcomes.exists():
            # Still need the program to check for POs
            loaded_course = LoadedCourse.objects.filter(pk=loaded_course_id).select_related("course__program").first()
            program_outcomes = []
            if loaded_course and loaded_course.course.program:
                program_outcomes = ProgramOutcome.objects.filter(program=loaded_course.course.program)
            return Response({
                "program_outcomes": ProgramOutcomeSerializer(program_outcomes, many=True).data,
                "course_outcomes": [],
                "mapping": [],
            }, status=status.HTTP_200_OK)

        # If there are COs, fetch their program via the first CO
        program = course_outcomes.first().loaded_course.course.program
        program_outcomes = ProgramOutcome.objects.filter(program=program)

        # Create mappings only if both COs and POs exist
        if program_outcomes.exists() and course_outcomes.exists():
            for co in course_outcomes:
                for po in program_outcomes:
                    OutcomeMapping.objects.get_or_create(program_outcome=po, course_outcome=co)

        mappings = OutcomeMapping.objects.filter(
            program_outcome__in=program_outcomes,
            course_outcome__in=course_outcomes,
        )

        return Response({
            "program_outcomes": ProgramOutcomeSerializer(program_outcomes, many=True).data,
            "course_outcomes": CourseOutcomeSerializer(course_outcomes, many=True).data,
            "mapping": OutcomeMappingSerializer(mappings, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_outcome_mapping(request, pk):
    """
    Updates one mapping cell.
    """
    try:
        mapping = OutcomeMapping.objects.get(pk=pk)
        value = request.data.get("outcome_mapping", "").strip().upper()
        if value not in ["", "I", "D", "E"]:
            return Response({"detail": "Invalid mapping value. Must be '', 'I', 'D', or 'E'."},
                            status=status.HTTP_400_BAD_REQUEST)
        mapping.outcome_mapping = value if value else None
        mapping.save()
        return Response(OutcomeMappingSerializer(mapping).data, status=status.HTTP_200_OK)
    except OutcomeMapping.DoesNotExist:
        return Response({"detail": "Mapping not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Class Record
# ====================================================
class ClassRecordViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        try:
            section = (
                Section.objects
                .select_related("loaded_course__course__program__department")
                .prefetch_related(
                    Prefetch(
                        "courseterm_set",
                        queryset=CourseTerm.objects.prefetch_related(
                            Prefetch(
                                "courseunit_set",
                                queryset=CourseUnit.objects.prefetch_related(
                                    Prefetch(
                                        "coursecomponent_set",
                                        queryset=CourseComponent.objects.prefetch_related(
                                            Prefetch("assessment_set", queryset=Assessment.objects.prefetch_related("blooms_classification", "course_outcome"))
                                        )
                                    )
                                )
                            )
                        )
                    ),
                    Prefetch(
                        "student_set",
                        queryset=Student.objects.prefetch_related(
                            Prefetch("rawscore_set", queryset=RawScore.objects.select_related("assessment"))
                        )
                    )
                )
                .get(pk=pk)
            )

        except Section.DoesNotExist:
            return Response({"detail": "Section not found"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClassRecordSerializer(section)
        return Response(serializer.data)

class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        section_id = self.request.query_params.get("section")
        qs = self.queryset.select_related("section")
        if section_id:
            return qs.filter(section_id=section_id)
        return qs

    def perform_create(self, serializer):
        section_id = self.request.query_params.get("section")
        if section_id is None:
            raise serializers.ValidationError("Section is required")
        student = serializer.save(section_id=section_id)

        assessments = Assessment.objects.filter(course_component__course_unit__course_term__section_id=section_id)
        raw_scores = [
            RawScore(student=student, assessment=assessment, raw_score=0)
            for assessment in assessments
        ]
        RawScore.objects.bulk_create(raw_scores)

        return student

class AssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        qs = self.queryset.select_related("course_component")
        component_id = self.request.query_params.get("component")
        if component_id:
            return qs.filter(course_component_id=component_id)
        return qs
    
    def perform_create(self, serializer):
        assessment = serializer.save()
        section = assessment.course_component.course_unit.course_term.section
        students = Student.objects.filter(section=section)
        raw_scores = [
            RawScore(student=student, assessment=assessment, raw_score=0)
            for student in students
        ]
        RawScore.objects.bulk_create(raw_scores)

        return assessment
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment = self.perform_create(serializer)
        output_serializer = self.get_serializer(assessment)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="info")
    def get_assessment_info(self, request, pk=None):
        try:
            assessment = self.get_object()
        except Assessment.DoesNotExist:
            return Response({"error": "Assessment not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(assessment)
        return Response({
            "id": assessment.assessment_id,
            "blooms_classification": serializer.data.get("blooms_classification", []),
            "course_outcome": serializer.data.get("course_outcome", []),
        })
    
class CourseComponentViewSet(viewsets.ModelViewSet):
    queryset = CourseComponent.objects.all()
    serializer_class = CourseComponentSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete a course component"}, status=status.HTTP_403_FORBIDDEN)
    
class CourseUnitViewSet(viewsets.ModelViewSet):
    queryset = CourseUnit.objects.all()
    serializer_class = CourseUnitSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete a course unit"}, status=status.HTTP_403_FORBIDDEN)

class RawScoreUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, student_id, assessment_id):
        try:
            rawscore = RawScore.objects.get(student_id=student_id, assessment_id=assessment_id)
        except RawScore.DoesNotExist:
            return Response({"detail": "RawScore not found"}, status=status.HTTP_404_NOT_FOUND)
        
        value = request.data.get("value")
        rawscore.raw_score = value
        rawscore.save()
        return Response({"student_id": student_id, "assessment_id": assessment_id, "value": value})

# ====================================================
# Assessment Page
# ====================================================
class AssessmentPageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, section_id):
        try:
            section = (
                Section.objects
                .select_related(
                    "loaded_course__course__program__department__college__campus",
                    "loaded_course__academic_year",
                    "instructor_assigned",
                )
                .get(pk=section_id)
            )
        except Section.DoesNotExist:
            return Response({"detail": "Section not found."}, status=status.HTTP_404_NOT_FOUND)

        loaded_course = section.loaded_course
        course = loaded_course.course
        program = course.program
        academic_year = loaded_course.academic_year
        department = getattr(program, "department", None)
        campus_name = getattr(getattr(department, "campus", None), "campus_name", None)
        college_name = getattr(getattr(department, "college", None), "college_name", None)
        department_name = getattr(department, "department_name", None)

        info = {
            "university_hierarchy": " / ".join(
                [p for p in [campus_name, college_name, department_name] if p]
            ),
            "program_name": getattr(program, "program_name", "") or "",
            "course_title": getattr(course, "course_title", "") or "",
            "academic_year_and_semester_type": (
                f"{getattr(academic_year, 'academic_year_start', '')} - "
                f"{getattr(academic_year, 'academic_year_end', '')} / "
                f"{getattr(course.semester, 'semester_type', '')}"
            ),
            "instructor_assigned": (
                f"{getattr(section.instructor_assigned,'first_name','') or ''} "
                f"{getattr(section.instructor_assigned,'last_name','') or ''}".strip()
                if section.instructor_assigned else ""
            ),
        }

        BLOOM_ORDER = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
        BLOOM_INDEX = {b: i for i, b in enumerate(BLOOM_ORDER)}

        def normalize_bloom_names(blooms_qs):
            if not blooms_qs:
                return "Unclassified"
            names = {b.blooms_classification_type for b in blooms_qs}
            ordered = sorted(names, key=lambda n: BLOOM_INDEX.get(n, 999))
            return " / ".join(ordered)

        def co_code_num(co_code):
            try:
                return int("".join(ch for ch in (co_code or "") if ch.isdigit()))
            except ValueError:
                return 9999

        def format_co_label(co_codes, course_unit_type):
            codes_sorted = sorted(co_codes, key=co_code_num)
            if len(codes_sorted) == 1:
                return f"{codes_sorted[0]} ({course_unit_type})" if course_unit_type else codes_sorted[0]
            if len(codes_sorted) == 2:
                return f"{codes_sorted[0]} & {codes_sorted[1]}"
            return f"{', '.join(codes_sorted[:-1])}, & {codes_sorted[-1]}"

        assessments_qs = (
            Assessment.objects
            .filter(course_component__course_unit__course_term__section=section)
            .select_related(
                "course_component__course_unit__course_term",
                "course_component__course_unit",
                "course_component",
            )
            .prefetch_related("blooms_classification", "course_outcome")
            .order_by("assessment_id")
        )

        co_qs = CourseOutcome.objects.filter(loaded_course=loaded_course)
        co_id_to_code = {co.course_outcome_id: co.course_outcome_code for co in co_qs}

        co_to_po_codes = defaultdict(set)
        mappings_qs = OutcomeMapping.objects.filter(
            course_outcome__loaded_course=loaded_course,
            program_outcome__program=program,
            outcome_mapping__in=["I", "D", "E"],
        ).select_related("program_outcome", "course_outcome")

        for m in mappings_qs:
            co_code = getattr(m.course_outcome, "course_outcome_code", None)
            po_code = getattr(m.program_outcome, "program_outcome_code", None)
            if co_code and po_code:
                co_to_po_codes[co_code].add(po_code)

        co_to_bloom_to_assess = defaultdict(lambda: defaultdict(list))
        assessment_ids_in_order = []

        for a in assessments_qs:
            unit_type = getattr(getattr(a.course_component, "course_unit", None), "course_unit_type", None)
            a_co_codes = [
                co_id_to_code.get(co.course_outcome_id)
                for co in a.course_outcome.all()
                if co.loaded_course_id == loaded_course.loaded_course_id
            ]
            if not a_co_codes:
                assessment_ids_in_order.append(a.assessment_id)
                continue

            co_label = format_co_label([c for c in a_co_codes if c], unit_type)
            bloom_key = normalize_bloom_names(list(a.blooms_classification.all()))
            co_to_bloom_to_assess[co_label][bloom_key].append({
                "assessment_id": a.assessment_id,
                "assessment_title": a.assessment_title,
                "assessment_highest_score": a.assessment_highest_score,
            })
            assessment_ids_in_order.append(a.assessment_id)

        def first_co_code_from_label(lbl):
            base = lbl.split(" (")[0]
            first = base.split(",")[0].split("&")[0].strip()
            return co_code_num(first)

        course_outcomes_payload = []

        po_to_co_map = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

        for co_label, bloom_map in co_to_bloom_to_assess.items():
            base_label = co_label.split(" (")[0]  # e.g. "CO1" from "CO1 (Lecture)"
            co_codes = [c.strip() for c in base_label.replace("&", ",").split(",") if c.strip()]

            merged_po_codes = set()
            for co_code in co_codes:
                merged_po_codes |= co_to_po_codes.get(co_code, set())

            po_key = ", ".join(sorted(merged_po_codes, key=lambda s: s.lower())) if merged_po_codes else ""

            for bloom_label, assessments in bloom_map.items():
                po_to_co_map[po_key][base_label][bloom_label].extend(assessments)


        course_outcomes_payload = []
        for po_key, co_groups in po_to_co_map.items():
            co_entries = []
            for co_code, blooms in sorted(co_groups.items(), key=lambda x: co_code_num(x[0])):
                # split lecture/lab variants
                lec_lab_variants = defaultdict(lambda: defaultdict(list))
                for bloom_label, assessments in blooms.items():
                    for a in assessments:
                        # look up unit type
                        unit_type = getattr(
                            Assessment.objects.get(pk=a["assessment_id"]).course_component.course_unit,
                            "course_unit_type",
                            None,
                        )

                        # if multiple COs (e.g. CO1 & CO2 or comma-separated), ignore lecture/lab suffix
                        if "&" in co_code or "," in co_code:
                            label = co_code  # no split
                        else:
                            label = f"{co_code} ({unit_type})" if unit_type else co_code

                        lec_lab_variants[label][bloom_label].append(a)

                # build the final nested payload per variant
                variant_entries = []
                for variant_label, bloom_map in lec_lab_variants.items():
                    bloom_entry_dict = {
                        bk: bloom_map[bk]
                        for bk in sorted(
                            bloom_map.keys(),
                            key=lambda k: BLOOM_INDEX.get(k.split(" / ")[0], 999)
                        )
                    }
                    variant_entries.append({
                        variant_label: [
                            {"blooms_classification": [bloom_entry_dict]}
                        ]
                    })

                co_entries.append({
                    co_code: variant_entries
                })

            course_outcomes_payload.append({
                po_key or "": [
                    {"course_outcomes": co_entries}
                ]
            })

        assessments_payload = [{"program_outcomes": course_outcomes_payload}]

        # =================== STUDENTS ===================
        students_qs = Student.objects.filter(section=section).order_by("student_id")
        raw_scores_qs = RawScore.objects.filter(assessment__in=assessments_qs).select_related("assessment", "student")
        scores_by_student = defaultdict(dict)
        for rs in raw_scores_qs:
            scores_by_student[rs.student_id][rs.assessment.assessment_id] = rs.raw_score

        seen = set()
        ordered_assessment_ids = []
        for aid in assessment_ids_in_order:
            if aid not in seen:
                seen.add(aid)
                ordered_assessment_ids.append(aid)

        students_list = [{
            "student_id": s.student_id,
            "id_number": s.id_number,
            "student_name": s.student_name,
            "scores": [
                {"assessment_id": aid, "value": scores_by_student.get(s.student_id, {}).get(aid, None)}
                for aid in ordered_assessment_ids
            ]
        } for s in students_qs]

        # =================== RESPONSE ===================
        response = {
            "info": info,
            "assessments": assessments_payload,
            "students": students_list,
        }

        return Response(response, status=status.HTTP_200_OK)

# ====================================================
# Dean
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dean_loaded_courses_view(request, department_id):
    try:
        department = Department.objects.select_related("college").get(pk=department_id)
        college = department.college

        if not college:
            return JsonResponse({"message": "Department has no assigned college"}, status=400)

        loaded_courses = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college",
                "course__year_level",
                "course__semester",
                "academic_year",
            )
            .filter(course__program__department__college=college)
            .order_by("loaded_course_id")
        )

        serializer = DeanLoadedCourseSerializer(loaded_courses, many=True)
        return Response(serializer.data, status=200)

    except Department.DoesNotExist:
        return JsonResponse({"message": "Department not found"}, status=404)

    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dean_course_page_view(request, loaded_course_id):
    try:
        loaded_course = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college__campus",
                "course__semester",
                "course__year_level",
                "academic_year"
            )
            .get(pk=loaded_course_id)
        )

        course = loaded_course.course
        ay = loaded_course.academic_year
        dept = course.program.department
        college = dept.college
        campus = dept.campus

        course_details = {
            "course_code": course.course_code,
            "course_title": course.course_title,
            "academic_year": f"{ay.academic_year_start}-{ay.academic_year_end}",
            "semester_type": course.semester.semester_type,
            "year_level": course.year_level.year_level_type,
            "department_name": dept.department_name,
            "college_name": college.college_name,
            "campus_name": campus.campus_name,
        }

        sections = Section.objects.filter(loaded_course_id=loaded_course_id)
        serializer = DeanSectionSerializer(sections, many=True)

        section_data = [
            {
                "id": s["section_id"],
                "year_and_section": s["year_and_section"],
                "instructor_assigned": s["instructor_assigned"],
                "instructor_id": s["instructor_id"],
            }
            for s in serializer.data
        ]

        return JsonResponse(
            {
                "course_details": course_details,
                "sections": section_data,
            },
            status=200
        )

    except LoadedCourse.DoesNotExist:
        return JsonResponse({"message": "Loaded course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

# ====================================================
# VCAA and VPAA
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def campus_loaded_courses_view(request, department_id):
    try:
        dept = Department.objects.select_related("campus").get(pk=department_id)
        campus_id = dept.campus_id

        loaded_courses = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__campus",
                "course__program",
                "course__semester",
                "course__year_level",
                "academic_year"
            )
            .filter(course__program__department__campus_id=campus_id)
            .order_by("course__course_code")
        )

        serializer = CampusLoadedCourseSerializer(loaded_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Department.DoesNotExist:
        return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def campus_course_page_view(request, loaded_course_id):
    try:
        
        loaded_course = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college__campus",
                "course__semester",
                "course__year_level",
                "academic_year",
            )
            .get(pk=loaded_course_id)
        )

        course = loaded_course.course
        ay = loaded_course.academic_year
        program = course.program
        department = program.department
        college = department.college
        campus = department.campus

        course_details = {
            "course_code": course.course_code,
            "course_title": course.course_title,
            "program_name": program.program_name,
            "academic_year_start": ay.academic_year_start,
            "academic_year_end": ay.academic_year_end,
            "semester_type": course.semester.semester_type,
            "year_level_type": course.year_level.year_level_type,
            "department_name": department.department_name,
            "college_name": college.college_name,
            "campus_name": campus.campus_name,
        }

        sections = (
            Section.objects
            .filter(loaded_course_id=loaded_course_id)
            .select_related("instructor_assigned")
        )

        section_serializer = CampusSectionDisplaySerializer(sections, many=True)
        sections_list = [
            {
                "id": s["section_id"],
                "year_and_section": s["year_and_section"],
                "instructor_assigned": s["instructor_assigned"],
                "instructor_id": s["instructor_id"],
            }
            for s in section_serializer.data
        ]

        return JsonResponse(
            {
                "course_details": course_details,
                "sections": sections_list,
            },
            status=status.HTTP_200_OK,
        )

    except LoadedCourse.DoesNotExist:
        return JsonResponse(
            {"message": "Loaded course not found for this campus."},
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception as e:
        return JsonResponse(
            {"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

# ====================================================
# Dropdown
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_role_list_view(request):
    try:
        roles = UserRole.objects.exclude(user_role_type__iexact="Administrator")
        serializer = UserRoleSerializer(roles, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def department_list_view(request):
    try:
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def program_list_view(request):
    try:
        programs = Program.objects.all()
        serializer = ProgramSerializer(programs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def year_level_list_view(request):
    try:
        year_levels = YearLevel.objects.all()
        serializer = YearLevelSerializer(year_levels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def semester_list_view(request):
    try:
        semesters = Semester.objects.all()
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def credit_unit_list_view(request):
    try:
        credits = Credit.objects.all()
        serializer = CreditSerializer(credits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def academic_year_list_view(request):
    try:
        academic_years = AcademicYear.objects.all()
        serializer = AcademicYearSerializer(academic_years, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_list_view(request):
    try:
        department_id = request.query_params.get("department_id")
        instructors = User.objects.exclude(user_role_id=1)
        if department_id:
            instructors = instructors.filter(department_id=department_id)

        serializer = InstructorSerializer(instructors, many=True)
        return JsonResponse(serializer.data, safe=False)

    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def blooms_classification_list_view(request):
    try:
        blooms = BloomsClassification.objects.all().order_by("blooms_classification_id")
        serializer = BloomsClassificationSerializer(blooms, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_outcome_list_view(request, loaded_course_id):
    try:
        outcomes = (
            CourseOutcome.objects
            .filter(loaded_course_id=loaded_course_id)
            .order_by("course_outcome_id")
        )
        serializer = CourseOutcomeSerializer(outcomes, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Department Path
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_department_view(request, departmentId):
    try:
        department = Department.objects.select_related("college", "campus").filter(department_id=departmentId).first()
        if not department:
            return JsonResponse({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserDepartmentSerializer(department)
        return JsonResponse(serializer.data, safe=False)

    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)