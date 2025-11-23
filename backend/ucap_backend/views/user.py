from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from ucap_backend.models import Department
from ucap_backend.serializers.user import CurrentUserSerializer, UserDepartmentSerializer

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
        return Response({"message": "Login Successful."}, status=status.HTTP_200_OK)
    return Response({"error": "Invalid Login Credentials."}, status=status.HTTP_401_UNAUTHORIZED)

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
# User Department
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