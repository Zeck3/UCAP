from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucap_backend.models import User
from ucap_backend.serializers.admin import CreateFacultySerializer, FacultySerializer, UpdateFacultySerializer

# ====================================================
# User Management
# ====================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def user_management_view(request):
    if request.method == "GET":
        try:
            faculty_excluded = User.objects.exclude(user_role__user_role_type="Administrator")
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
            return JsonResponse(FacultySerializer(user).data, safe=False, status=status.HTTP_201_CREATED)
        
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