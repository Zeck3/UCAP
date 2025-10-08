from django.http import JsonResponse
from .models import *
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, viewsets
from .serializers import *
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

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
@permission_classes([IsAuthenticated])
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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)
  
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_assigned_sections_view(request, instructor_id, loaded_course_id):
    try:
        assigned_sections = Section.objects.filter(instructor_assigned=instructor_id, loaded_course=loaded_course_id)
        serializer = InstructorAssignedSectionSerializer(assigned_sections, many=True)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)
    
# ====================================================
# Class Record
# ====================================================
class ClassRecordViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def retrieve(self, request, pk=None):
        try:
            section = (
                Section.objects
                .select_related(
                    'loaded_course__course__program__department'
                )
                .prefetch_related(
                    Prefetch(
                        'courseterm_set',
                        queryset=CourseTerm.objects.prefetch_related(
                            Prefetch(
                                'courseunit_set',
                                queryset=CourseUnit.objects.prefetch_related(
                                    Prefetch(
                                        'coursecomponent_set',
                                        queryset=CourseComponent.objects.prefetch_related('assessment_set')
                                    )
                                )
                            )
                        )
                    ),
                    Prefetch(
                        'student_set',
                        queryset=Student.objects.prefetch_related(
                            Prefetch('rawscore_set', queryset=RawScore.objects.select_related('assessment'))
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
    permission_classes = [AllowAny]
    
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        section_id = self.request.query_params.get("section")
        qs = self.queryset.select_related('section')
        if section_id:
            return qs.filter(section_id=section_id)
        return qs

class AssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        qs = self.queryset.select_related('course_component')
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
    permission_classes = [AllowAny]
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


# @api_view(["POST"])
# def load_course(request, course_code):
#     try:
#         course = Course.objects.get(course_code=course_code)

#         academic_year_id = request.data.get("academic_year_id")
#         academic_year = AcademicYear.objects.get(academic_year_id=academic_year_id)

#         loaded_course = LoadedCourseTable.objects.create(loaded_course_code=course, loaded_academic_year_id=academic_year)
#         serializer = LoadedCourseSerializer(loaded_course)
#         return JsonResponse(serializer.data, safe=False)
#     except Exception as e:
#         return JsonResponse({"message": str(e)}, status=500)

# #===== DEPARTMENT CHAIR COURSE & SECTION MANAGEMENT =============================================================================================================================
# @api_view(["GET"])
# def get_department_courses(request, department_id):
#     try:
#         courses = Course.objects.filter(course_program_id__program_department_id=department_id)
#         serializer = CourseSerializer(courses, many=True)
#         return JsonResponse(serializer.data, safe=False)
#     except Exception as e:
#         return JsonResponse({"message": str(e)}, status=500)
    
# @api_view(["GET"])
# def get_department_course_sections(request, department_id, course_code):
#     try:
#         sections = Section.objects.filter(section_loaded_course_id__loaded_course_code__course_program_id__program_department_id=department_id, section_loaded_course_id__loaded_course_code__course_code=course_code)
#         serializer = SectionSerializer(sections, many=True)
#         return JsonResponse(serializer.data, safe=False)
#     except Exception as e:
#         return JsonResponse({"message": str(e)}, status=500)
    
# @api_view(["PUT"])
# def assign_instructor(request, section_id):
#     try:
#         section = Section.objects.get(section_id=section_id)
#         instructor_id = request.data.get("instructor_id")
#         instructor = User.objects.get(user_id=instructor_id)

#         section.section_instructor_assigned_id = instructor
#         section.save()

#         serializer = SectionSerializer(section)
#         return JsonResponse({"message": "Assigned Instructor Successfully"}, safe=False)
#     except Section.DoesNotExist:
#         return JsonResponse({"message": "Section not found"}, status=404)
#     except User.DoesNotExist:
#         return JsonResponse({"message": "Instructor not found"}, status=404)
#     except Exception as e:
#         return JsonResponse({"message": str(e)}, status=500)
    
# @api_view(["GET"])
# def get_department_instructors(request, department_id):
#     try:
#         department = User.objects.filter(user_department_id=department_id)
#         serializer = DepartmentInstructorSerializer(department, many=True)
#         return JsonResponse(serializer.data, safe=False)
#     except Exception as e:
#         return JsonResponse({"message": str(e)}, status=500)

# @api_view(["POST"])
# def create_section(request):
#     try:
#         data = json.loads(request.body)
#         serializer = CreateSectionSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return JsonResponse({
#                 "message": "Section created successfully"
#             }, status=201)
#         else:
#             return JsonResponse(serializer.errors, status=400)
#     except Exception as e:
#         return JsonResponse({"message": str(e)}, status=500)