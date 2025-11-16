from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ucap_backend.models import Course, LoadedCourse, Program, ProgramOutcome, Section
from ucap_backend.serializers.department_chair import CreateDepartmentLoadedCourseSerializer, DepartmentChairCourseDetailsSerializer, DepartmentChairSectionSerializer, DepartmentCourseSerializer, DepartmentLoadedCourseSerializer, SectionCreateUpdateSerializer
from ucap_backend.serializers.instructor import ProgramOutcomeSerializer

# ====================================================
# Department Chair
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def department_course_list_view(request, department_id):
    try:
        courses = Course.objects.filter(program__department__department_id=department_id)
        serializer = DepartmentCourseSerializer(courses, many=True)
        return JsonResponse(serializer.data, safe=False, status=status.HTTP_200_OK)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def department_course_management_view(request, department_id):
    try:
        if request.method == "GET":
            courses = LoadedCourse.objects.filter(
                course__program__department__department_id=department_id
            )
            serializer = DepartmentLoadedCourseSerializer(courses, many=True)
            return JsonResponse(serializer.data, safe=False)

        serializer = CreateDepartmentLoadedCourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(
                {"message": "Course loaded successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )

        errors = serializer.errors
        non_field = errors.get("non_field_errors")
        if isinstance(non_field, list) and non_field:
            msg = str(non_field[0])
            return JsonResponse(
                {
                    "code": "course_already_loaded",
                    "message": msg,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return JsonResponse(
            {
                "code": "validation_error",
                "message": "Validation error.",
                "errors": errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def department_course_detail_view(request, loaded_course_id):
    try:
        course = LoadedCourse.objects.get(loaded_course_id=loaded_course_id)
        course.delete()
        return JsonResponse({"message": "Course deleted successfully"}, status=status.HTTP_200_OK)
    except LoadedCourse.DoesNotExist:
        return JsonResponse({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def department_section_management_view(request, loaded_course_id):
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

        dummy_section = (
            Section(
                loaded_course=loaded_course,
                instructor_assigned=None,
                year_and_section=""
            )
        )
        course_details = DepartmentChairCourseDetailsSerializer(dummy_section).data

        if request.method == "GET":
            sections = (
                Section.objects
                .select_related(
                    "loaded_course__course__program__department__college__campus",
                    "loaded_course__course__semester",
                    "loaded_course__course__year_level",
                    "loaded_course__academic_year",
                    "instructor_assigned",
                )
                .filter(loaded_course_id=loaded_course_id)
            )

            section_data = DepartmentChairSectionSerializer(sections, many=True).data

            return JsonResponse({
                "course_details": course_details,
                "sections": section_data
            }, status=status.HTTP_200_OK)

        serializer = SectionCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({"message": "Section created successfully"}, status=status.HTTP_201_CREATED)

        return JsonResponse({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    except LoadedCourse.DoesNotExist:
        return JsonResponse({"message": "Loaded course not found"}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def department_section_detail_view(request, section_id):
    try:
        section = Section.objects.get(pk=section_id)

        if request.method in ["PUT", "PATCH"]:
            serializer = SectionCreateUpdateSerializer(instance=section, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({"message": "Section updated successfully"}, status=status.HTTP_200_OK)
            return JsonResponse({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        section.delete()
        return JsonResponse({"message": "Section deleted successfully"}, status=status.HTTP_200_OK)

    except Section.DoesNotExist:
        return JsonResponse({"message": "Section not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Program Outcomes
# ====================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def program_outcome_list_create_view(request, program_id):
    try:
        if request.method == "GET":
            outcomes = ProgramOutcome.objects.filter(program_id=program_id).order_by("program_outcome_id")
            serializer = ProgramOutcomeSerializer(outcomes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        try:
            program = Program.objects.get(pk=program_id)
        except Program.DoesNotExist:
            return Response({"message": "Program not found"}, status=status.HTTP_404_NOT_FOUND)

        last_outcome = ProgramOutcome.objects.filter(program=program).order_by("program_outcome_id").last()
        
        if last_outcome:
            last_letter = last_outcome.program_outcome_code.split("-")[-1]
            next_letter = chr(ord(last_letter.lower()) + 1)
        else:
            next_letter = "a"

        next_code = f"PO-{next_letter}"

        serializer = ProgramOutcomeSerializer(
            data={
                "program_outcome_code": next_code,
                "program_outcome_description": request.data.get("program_outcome_description", ""),
            }
        )

        if serializer.is_valid():
            serializer.save(program=program)
            return Response(
                {"message": "Program Outcome added successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def program_outcome_detail_view(request, outcome_id):
    try:
        outcome = ProgramOutcome.objects.get(pk=outcome_id)

        if request.method == "PUT":
            serializer = ProgramOutcomeSerializer(outcome, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Program Outcome updated", "data": serializer.data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        latest = ProgramOutcome.objects.filter(program=outcome.program).order_by("program_outcome_id").last()
        if latest.program_outcome_id != outcome.program_outcome_id:
            return Response(
                {"message": "Only the most recent Program Outcome can be deleted."},
                status=status.HTTP_403_FORBIDDEN,
            )
        outcome.delete()
        return Response({"message": "Program Outcome deleted successfully"}, status=status.HTTP_200_OK)

    except ProgramOutcome.DoesNotExist:
        return Response({"message": "Program Outcome not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)