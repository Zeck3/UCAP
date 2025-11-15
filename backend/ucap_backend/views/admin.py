import json
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucap_backend.models import Course, User
from ucap_backend.serializers.admin import CourseSerializer, CreateCourseSerializer, CreateFacultySerializer, FacultySerializer, UpdateCourseSerializer, UpdateFacultySerializer

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

    try:
        payload = request.data
        print("POST payload:", payload)
        
        serializer = CreateFacultySerializer(data=payload)
        if serializer.is_valid():
            user = serializer.save()
            print("Created user:", user)
            return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)
        
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
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(FacultySerializer(user).data)

    if request.method in ["PUT", "PATCH"]:
        serializer = UpdateFacultySerializer(
            user,
            data=request.data,
            partial=(request.method == "PATCH")
        )
        if serializer.is_valid():
            updated = serializer.save()
            return Response(FacultySerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)

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

        serializer = CreateCourseSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.save()
            return Response(CourseSerializer(course).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def course_detail_view(request, course_code):
    try:
        course = Course.objects.get(course_code=course_code)
    except Course.DoesNotExist:
        return Response({"message": "Course not found"}, status=404)

    if request.method == "GET":
        return Response(CourseSerializer(course).data)

    if request.method in ["PUT", "PATCH"]:
        serializer = UpdateCourseSerializer(
            course,
            data=request.data,
            partial=(request.method == "PATCH")
        )
        if serializer.is_valid():
            serializer.save()
            return Response(CourseSerializer(course).data)
        return Response(serializer.errors, status=400)

    course.delete()
    return Response({"message": "Course deleted successfully"}, status=200)
