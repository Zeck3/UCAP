from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from ucap_backend.serializers.dean import DeanCourseDetailsSerializer, DeanLoadedCourseSerializer, DeanSectionSerializer
from ucap_backend.models import LoadedCourse, Section

# ====================================================
# Dean
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dean_loaded_courses_view(request, college_id):
    try:
        user_college_id = getattr(request.user, "dean_college_id", None)
        if user_college_id is None or int(user_college_id) != int(college_id):
            raise PermissionDenied("You are not assigned to this college.")

        loaded_courses = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college",
                "course__year_level",
                "course__semester",
                "academic_year",
            )
            .filter(course__program__department__college_id=college_id)
            .order_by("loaded_course_id")
        )

        serializer = DeanLoadedCourseSerializer(loaded_courses, many=True)
        return Response(serializer.data, status=200)

    except PermissionDenied as e:
        return JsonResponse({"message": str(e)}, status=403)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dean_course_page_view(request, loaded_course_id):
    try:
        loaded_course = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__college__campus",
                "course__semester",
                "course__year_level",
                "academic_year"
            )
            .get(pk=loaded_course_id)
        )

        dummy_section = Section(
            loaded_course=loaded_course,
            instructor_assigned=None,
            year_and_section=""
        )

        course_details = DeanCourseDetailsSerializer(dummy_section).data

        sections = Section.objects.filter(loaded_course_id=loaded_course_id).select_related("instructor_assigned")
        sections_data = DeanSectionSerializer(sections, many=True).data

        return Response({
            "course_details": course_details,
            "sections": sections_data
        }, status=status.HTTP_200_OK)

    except LoadedCourse.DoesNotExist:
        return Response({"message": "Loaded course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
