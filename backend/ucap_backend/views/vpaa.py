from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from ucap_backend.models import LoadedCourse, Section
from ucap_backend.serializers.vpaa import VpaaLoadedCourseSerializer, VpaaCourseDetailsSerializer, VpaaSectionSerializer

# ====================================================
# VPAA
# ====================================================
def assert_university_access(user):
    role = getattr(user, "user_role", None)

    scope = getattr(role, "scope", None)
    role_type = (getattr(role, "user_role_type", "") or "").lower()

    is_vpaa = "vice president for academic affairs" in role_type
    is_university_scope = scope == "university"

    if not (is_university_scope or is_vpaa or user.is_superuser or user.is_staff):
        raise PermissionDenied("You are not allowed to access university-wide data.")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vpaa_loaded_courses_view(request):
    try:
        assert_university_access(request.user)

        loaded_courses = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college__campus",
                "course__program",
                "course__semester",
                "course__year_level",
                "academic_year",
            )
            .all()
            .order_by("course__course_code", "loaded_course_id")
        )

        serializer = VpaaLoadedCourseSerializer(loaded_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except PermissionDenied as e:
        return Response({"message": str(e)}, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vpaa_course_page_view(request, loaded_course_id):
    try:
        assert_university_access(request.user)

        loaded_course = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college__campus",
                "course__semester",
                "course__year_level",
                "academic_year",
            )
            .get(pk=loaded_course_id)
        )

        dummy_section = Section(
            loaded_course=loaded_course,
            instructor_assigned=None,
            year_and_section=""
        )

        course_details = VpaaCourseDetailsSerializer(dummy_section).data

        sections = (
            Section.objects
            .select_related("instructor_assigned")
            .filter(loaded_course_id=loaded_course_id)
        )
        sections_data = VpaaSectionSerializer(sections, many=True).data

        return Response(
            {
                "course_details": course_details,
                "sections": sections_data,
            },
            status=status.HTTP_200_OK
        )

    except LoadedCourse.DoesNotExist:
        return Response(
            {"message": "Loaded course not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except PermissionDenied as e:
        return Response({"message": str(e)}, status=status.HTTP_403_FORBIDDEN)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
