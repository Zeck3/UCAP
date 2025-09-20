from django.http import JsonResponse
from .models import *
import json
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import *

@api_view(["GET"])
def hello_view(request):
    return JsonResponse({"message": "Hello from Django!"})

#===== GET SERIALIZERS =============================================================================================================================
@api_view(["GET"])
def get_roles(request):
    try:
        roles = Role.objects.exclude(role__iexact="Administrator")
        serializer = RoleSerializer(roles, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_campus(request):
    try:
        campus = Campus.objects.all()
        serializer = CampusSerializer(campus, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
def get_departments(request):
    try:
        departments = Department.objects.all()
        serializer = DepartmentSerializer(departments, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
def get_programs(request):
    try:
        programs = Program.objects.all()
        serializer = ProgramSerializer(programs, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_academic_years(request):
    try:
        academic_years = AcademicYear.objects.all()
        serializer = AcademicYearSerializer(academic_years, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
def get_colleges(request):
    try:
        colleges = College.objects.all()
        serializer = CollegeSerializer(colleges, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
def get_year_levels(request):
    try:
        year_levels = YearLevel.objects.all()
        serializer = YearLevelSerializer(year_levels, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["GET"])
def get_credits(request):
    try:
        credits = Credit.objects.all()
        serializer = CreditSerializer(credits, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_semesters(request):
    try:
        semesters = Semester.objects.all()
        serializer = SemesterSerializer(semesters, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
#===== INSTRUCTOR COURSES & SECTIONS =============================================================================================================================
@api_view(["GET"])
def instructor_courses(request, instructor_id):
    try:
        assigned_course = Section.objects.filter(section_instructor_assigned_id=instructor_id)

        seen = set()
        unique_courses = []
        for sec in assigned_course.select_related("section_loaded_course_id__loaded_course_code"):
            course = sec.section_loaded_course_id.loaded_course_code
            if course.pk not in seen:
                seen.add(course.pk)
                unique_courses.append(course)

        serializer = CourseSerializer(unique_courses, many=True)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)
    except Exception as e:
        return Response({"message": str(e)}, status=500)
    
@api_view(["GET"])
def instructor_sections(request, instructor_id, loaded_course_id):
    try:
        assigned_sections = Section.objects.filter(section_instructor_assigned_id=instructor_id, section_loaded_course_id=loaded_course_id)
        serializer = SectionSerializer(assigned_sections, many=True)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)
#============================================================================================================================================================
@api_view(["GET"])
def instructor_course_information(request, instructor_id):
    try:
        assigned_course_info = Section.objects.filter(section_instructor_assigned_id=instructor_id)
        serializer = SectionCourseSerializer(assigned_course_info, many=True)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)
    
#===== LOGIN AUTHENTICATION =============================================================================================================================
@api_view(["POST"])
def login_authentication(request):
    try:
        validator = LoginValidator(request.data)
        if validator.is_valid():
            user = validator.user
            return Response({
                "message": "Login successful",
                "user_id": user.user_id,
                "role_id": user.user_role_id.role_id,
                "department_id": user.user_department_id.department_id,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email
            }, status=status.HTTP_200_OK)
        else:
            return Response(validator.errors, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
#===== ADMIN COURSE & USER MANAGEMENT =============================================================================================================================
@api_view(["GET"])
def get_courses(request):
    try:
        courses = Course.objects.all()
        serializer = CourseListSerializer(courses, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_faculty(request):
    try:
        instructors = User.objects.all()
        serializer = InstructorSerializer(instructors, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)  

@api_view(["POST"])
def create_course(request):
    try:
        data = json.loads(request.body)
        serializer = CourseSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                "message": "Course created successfully"
            }, status=201)
        else:
            return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["PUT"])
def update_course(request, course_code):
    try:
        course = Course.objects.get(course_code=course_code)
        data = json.loads(request.body)
        serializer = CourseSerializer(course, data=data, partial=(request.method == "PATCH"))
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                "message": "Course updated successfully"
            }, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["DELETE"])
def delete_course(request, course_code):
    try:
        course = Course.objects.get(course_code=course_code)
        course.delete()
        return JsonResponse({"message": "Course deleted successfully"}, status=200)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["POST"])
def faculty_registration(request):
    try:
        data = json.loads(request.body)
        serializer = UserRegisterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                "message": "User registered successfully"
            }, status=201)
        else:
            print(serializer.errors)
            return JsonResponse({
                "message": "Validation failed",
                "errors": serializer.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["PUT", "PATCH"])
def update_faculty(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        data = json.loads(request.body)
        serializer = InstructorSerializer(user, data=data, partial=(request.method == "PUT"))
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                "message": "User updated successfully"
            }, status=200)
        else:
            return JsonResponse(serializer.errors, status=400)
    except User.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["DELETE"])
def delete_faculty(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
        user.delete()
        return JsonResponse({"message": "User deleted successfully"}, status=200)
    except User.DoesNotExist:
        return JsonResponse({"message": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

#============================================================================================================================

@api_view(["POST"])
def load_course(request, course_code):
    try:
        course = Course.objects.get(course_code=course_code)

        academic_year_id = request.data.get("academic_year_id")
        academic_year = AcademicYear.objects.get(academic_year_id=academic_year_id)

        loaded_course = LoadedCourseTable.objects.create(loaded_course_code=course, loaded_academic_year_id=academic_year)
        serializer = LoadedCourseSerializer(loaded_course)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

#===== DEPARTMENT CHAIR COURSE & SECTION MANAGEMENT =============================================================================================================================
@api_view(["GET"])
def get_department_courses(request, department_id):
    try:
        courses = Course.objects.filter(course_program_id__program_department_id=department_id)
        serializer = CourseSerializer(courses, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_department_course_sections(request, department_id, course_code):
    try:
        sections = Section.objects.filter(section_loaded_course_id__loaded_course_code__course_program_id__program_department_id=department_id, section_loaded_course_id__loaded_course_code__course_code=course_code)
        serializer = SectionSerializer(sections, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["PUT"])
def assign_instructor(request, section_id):
    try:
        section = Section.objects.get(section_id=section_id)
        instructor_id = request.data.get("instructor_id")
        instructor = User.objects.get(user_id=instructor_id)

        section.section_instructor_assigned_id = instructor
        section.save()

        serializer = SectionSerializer(section)
        return JsonResponse({"message": "Assigned Instructor Successfully"}, safe=False)
    except Section.DoesNotExist:
        return JsonResponse({"message": "Section not found"}, status=404)
    except User.DoesNotExist:
        return JsonResponse({"message": "Instructor not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_department_instructors(request, department_id):
    try:
        department = User.objects.filter(user_department_id=department_id)
        serializer = DepartmentInstructorSerializer(department, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["POST"])
def create_section(request):
    try:
        data = json.loads(request.body)
        serializer = CreateSectionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                "message": "Section created successfully"
            }, status=201)
        else:
            return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)