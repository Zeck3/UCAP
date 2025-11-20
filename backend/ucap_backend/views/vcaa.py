from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ucap_backend.models import Department, LoadedCourse, Section
from ucap_backend.serializers.vcaa import VcaaCourseDetailsSerializer, VcaaLoadedCourseSerializer, VcaaSectionSerializer

# ====================================================
# VCAA
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vcaa_loaded_courses_view(request, department_id):
    try:
        dept = Department.objects.select_related("campus").get(pk=department_id)
        campus_id = dept.campus_id

        loaded_courses = (
            LoadedCourse.objects
            .select_related(
                "course__program__department__campus",
                "course__program",
                "course__semester",
                "course__year_level",
                "academic_year"
            )
            .filter(course__program__department__campus_id=campus_id)
            .order_by("course__course_code")
        )

        serializer = VcaaLoadedCourseSerializer(loaded_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Department.DoesNotExist:
        return Response({"message": "Department not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def vcaa_course_page_view(request, loaded_course_id):
    try:
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

        course_details = VcaaCourseDetailsSerializer(dummy_section).data

        sections = Section.objects.filter(loaded_course_id=loaded_course_id).select_related("instructor_assigned")
        sections_data = VcaaSectionSerializer(sections, many=True).data

        return Response({
            "course_details": course_details,
            "sections": sections_data
        }, status=status.HTTP_200_OK)

    except LoadedCourse.DoesNotExist:
        return Response({"message": "Loaded course not found for this campus."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)