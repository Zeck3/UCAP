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
        serializer = InsturctorSerializer(instructors, many=True)
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
    
def user_registration(request):
    if request.method == "POST":
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
                return JsonResponse({
                    "message": "Validation failed",
                    "errors": serializer.errors
                }, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=500)

    return JsonResponse({"message": "Only POST method is allowed"}, status=405)

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
def create_section(request):
    try:
        data = request.data
        serializer = SectionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)