from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from ucap_backend.serializers.user import ChangePasswordSerializer, CurrentUserSerializer, UserInitialInfoSerializer

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
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([AllowAny])
def heartbeat_view(request):
    return Response({"detail": "alive"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    user = request.user
    old_password = serializer.validated_data["old_password"]
    new_password = serializer.validated_data["new_password"]

    if not user.check_password(old_password):
        return Response({"old_password": ["Old password is incorrect."]},
                        status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    update_session_auth_hash(request, user)

    return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)

# ====================================================
# User Initial Info
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_initial_info_view(request):
    serializer = UserInitialInfoSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
