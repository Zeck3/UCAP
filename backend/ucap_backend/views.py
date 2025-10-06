from django.http import JsonResponse
from .models import *
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt

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
# Department Chair Dashboard
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_department_details_view(request, department_id):
    try:
        department = Department.objects.filter(department_id=department_id)
        serializer = DepartmentDetailsSerializer(department, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
@permission_classes([AllowAny])
def get_department_courses(request, department_id):
    try:
        courses = LoadedCourse.objects.filter(course__program__department__department_id=department_id)
        serializer = DepartmentLoadedCoursesSerializer(courses, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_department_course_details_view(request, department_id, loaded_course_id):
    try:
        courses = LoadedCourse.objects.filter(course__program__department__department_id=department_id, loaded_course_id=loaded_course_id)
        serializer = DepartmentLoadedCourseDetailsSerializer(courses, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_department_course_sections(request, department_id, loaded_course_id):
    try:
        sections = Section.objects.filter(loaded_course__course__program__department__department_id=department_id, loaded_course_id=loaded_course_id)
        serializer = DepartmentChairSectionSerializer(sections, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["DELETE"])
@permission_classes([AllowAny])
def get_section_details_delete(request, section_id):
    try:
        section = Section.objects.get(section_id=section_id)
        section.delete()
        return JsonResponse({"message": "Section deleted successfully"}, status=200)
    except Section.DoesNotExist:
        return JsonResponse({"message": "Section not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def get_course_details_view(request, course_id):
    try:
        course = LoadedCourse.objects.get(loaded_course_id=course_id)
        course.delete()
        return JsonResponse({"message": "Course deleted successfully"}, status=200)
    except LoadedCourse.DoesNotExist:
        return JsonResponse({"message": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    

@api_view(["GET"])
@permission_classes([AllowAny])
def get_department_courses_view(request, department_id):
    try:
        not_loaded_courses = Course.objects.filter(program__department__department_id=department_id)
        serializer = DepartmentNotLoadedCoursesSerializer(not_loaded_courses, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["POST"])
@permission_classes([AllowAny])
def load_course(request):
    serializers = LoadDepartmentCourseSerializer(data=request.data)
    if serializers.is_valid():
        serializers.save()
        return JsonResponse({"message": "Course loaded successfully", "data": serializers.data}, status=200)
    else:
        return JsonResponse({"message": serializers.errors}, status=400)

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
        instructors = User.objects.exclude(user_role_id=1) 
        serializer = InstructorSerializer(instructors, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Department Path
# ====================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def department_path_view(request, departmentId):
    try:
        department = (Department.objects.filter(department_id=departmentId).values("department_name").distinct().first())
        if not department:
            return JsonResponse({"message": "Department not found"}, status=404)
        return JsonResponse(department, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
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

    



#------------------------------------------------------------------------------------------------------------------------------------

    
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def get_all_department_courses_view(request, departmentId):
#     try:
#         courses = Course.objects.filter(program__department__department_id=departmentId)
#         serializer = DepartmentCoursesSerializer(courses, many=True)
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