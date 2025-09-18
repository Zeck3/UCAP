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

@api_view(["GET"])
def get_roles(request):
    try:
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["GET"])
def get_intructors(request):
    try:
        instructors = User.objects.filter(role_id__role_type="Instructor")
        serializer = InstructorSerializer(instructors, many=True)
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
def get_colleges(request):
    try:
        colleges = College.objects.all()
        serializer = CollegeSerializer(colleges, many=True)
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
    
@api_view(["GET"])
def get_courses(request):
    try:
        courses = Course.objects.all()
        serializer = ViewCourseSerializer(courses, many=True)
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
            return JsonResponse(serializer.data, status=201)
        else:
            return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    

@api_view(["GET"])
def get_course(request, course_code):
    try:
        course = Course.objects.get(course_code=course_code)
        serializer = ViewCourseSerializer(course)
        return JsonResponse(serializer.data, status=200)
    except Course.DoesNotExist:
        return JsonResponse({"message": "Course not found"}, status=404)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["POST"])
def create_section(request):
    try:
        data = json.loads(request.body)
        serializer = SectionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        else:
            return JsonResponse(serializer.errors, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)
    
@api_view(["POST"])
def user_registration(request):
    try:
        data = json.loads(request.body)
        serializer = UserRegisterSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({
                "message": "User registered successfully",
                "user": serializer.data
            }, status=201)
        else:
            print(serializer.errors)
            return JsonResponse({
                "message": "Validation failed",
                "errors": serializer.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)

@api_view(["POST"])
def login_view(request):
    try:
        validator = LoginValidator(request.data)
        if validator.is_valid():
            user = validator.user
            return Response({
                "message": "Login successful",
                "user_id": user.user_id,
                "first_name": user.first_name,
                "role": user.role_id.role_type
            }, status=status.HTTP_200_OK)
        else:
            return Response(validator.errors, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def get_instructor_courses(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({"message": "Instructor ID is required"}, status=400)
    try:
        instructor = User.objects.get(user_id=user_id)
        courses = Course.objects.filter(user_id=instructor)
        serializer = ViewCourseSerializer(courses, many=True)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)
    
@api_view(["POST"])
def get_intructor_sections(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({"message": "Instructor ID is required"}, status=400)
    try:
        instructor = User.objects.get(user_id=user_id)
        sections = Section.objects.filter(instructor_assigned_id=instructor)
        serializer = ViewSectionSerializer(sections, many=True)
        return Response(serializer.data, status=200)
    except User.DoesNotExist:
        return Response({"message": "Instructor not found"}, status=404)