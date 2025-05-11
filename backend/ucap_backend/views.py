from django.http import JsonResponse
import bcrypt
from .models import role_tbl
import json
from django.views.decorators.csrf import csrf_exempt
from .serializers import RoleSerializer, UserRegisterSerializer, LoginValidator

def hello_view(request):
    return JsonResponse({"message": "Hello from Django!"})

@csrf_exempt
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

@csrf_exempt
def get_roles(request):
    if request.method == 'GET':
        roles = role_tbl.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return JsonResponse(serializer.data, safe=False)
    
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            validator = LoginValidator(data)
            if validator.is_valid():
                user = validator.user
                return JsonResponse({
                    "message": "Login successful",
                    "user_id": user.user_id,
                    "first_name": user.first_name,
                    "role": user.role_id.role_type
                }, status=200)
            else:
                return JsonResponse(validator.errors, status=401)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "Only POST method allowed"}, status=405)
    
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            validator = LoginValidator(data)
            if validator.is_valid():
                user = validator.user
                return JsonResponse({
                    "message": "Login successful",
                    "user_id": user.user_id,
                    "first_name": user.first_name,
                    "role": user.role_id.role_type
                }, status=200)
            else:
                return JsonResponse(validator.errors, status=401)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "Only POST method allowed"}, status=405)