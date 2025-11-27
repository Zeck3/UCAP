from django.http import JsonResponse
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from ucap_backend.models import AcademicYear, BloomsClassification, Campus, College, CourseOutcome, Credit, Department, Program, Semester, User, UserRole, YearLevel
from ucap_backend.serializers.instructor import BloomsClassificationSerializer, CourseOutcomeSerializer
from ucap_backend.serializers.base import AcademicYearSerializer, CampusSerializer, CollegeSerializer, CreditSerializer, DepartmentSerializer, InstructorSerializer, ProgramSerializer, SemesterSerializer, UserRoleSerializer, YearLevelSerializer  

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
def campus_list_view(request):
    try:
        campuses = Campus.objects.all().order_by("campus_name")
        serializer = CampusSerializer(campuses, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminWriteMixin:
    def get_permissions(self):
        if self.request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

class CollegeViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = College.objects.select_related("campus").order_by("college_name")
    serializer_class = CollegeSerializer

class DepartmentViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Department.objects.select_related("college", "campus").order_by("department_name")
    serializer_class = DepartmentSerializer

class ProgramViewSet(AdminWriteMixin, viewsets.ModelViewSet):
    queryset = Program.objects.select_related("department").order_by("program_name")
    serializer_class = ProgramSerializer


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
        department_id = request.query_params.get("department_id")

        instructors = (
            User.objects
            .select_related("user_role")
            .prefetch_related("departments")
            .exclude(user_role_id=1)
        )

        if department_id:
            instructors = instructors.filter(
                departments__department_id=department_id
            ).distinct()

        serializer = InstructorSerializer(instructors, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse(
            {"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def blooms_classification_list_view(request):
    try:
        blooms = BloomsClassification.objects.all().order_by("blooms_classification_id")
        serializer = BloomsClassificationSerializer(blooms, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_outcome_list_view(request, loaded_course_id):
    try:
        outcomes = (
            CourseOutcome.objects
            .filter(loaded_course_id=loaded_course_id, instructor=request.user)
            .filter(outcomemapping__outcome_mapping__isnull=False)
            .exclude(outcomemapping__outcome_mapping="")
            .distinct()
            .order_by("course_outcome_id")
        )
        serializer = CourseOutcomeSerializer(outcomes, many=True)
        return JsonResponse(serializer.data, safe=False)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
