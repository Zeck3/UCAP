from collections import defaultdict
import csv
from io import TextIOWrapper
import uuid
from django.db.models import Prefetch
from django.db.models.functions import Lower
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from rest_framework import status, viewsets, serializers
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ucap_backend.services.data_extraction import apply_extracted_override, extract_co_po
from ucap_backend.models import Assessment, CourseComponent, CourseOutcome, CourseTerm, CourseUnit, LoadedCourse, OutcomeMapping, ProgramOutcome, RawScore, Section, Student, User
from ucap_backend.serializers.instructor import AssessmentSerializer, ClassRecordSerializer, CourseComponentSerializer, CourseOutcomeSerializer, CourseUnitSerializer, InstructorCourseDetailsSerializer, InstructorLoadedCourseSerializer, InstructorSectionSerializer, OutcomeMappingSerializer, ProgramOutcomeSerializer, StudentSerializer

# ====================================================
# Instructor
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_loaded_courses_view(request, instructor_id):
    try:
        if int(instructor_id) != int(request.user.pk):
            return Response(
                {"detail": "Forbidden."},
                status=status.HTTP_403_FORBIDDEN
            )

        loaded_courses = (
            LoadedCourse.objects.filter(
                section__instructor_assigned=request.user
            )
            .select_related(
                "course",
                "course__program",
                "course__year_level",
                "course__semester",
                "academic_year",
                "course__program__department",
            )
            .distinct()
            .order_by("course__course_code")
        )

        serializer = InstructorLoadedCourseSerializer(loaded_courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"message": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_assigned_sections_view(request, instructor_id, loaded_course_id):
    try:
        if int(instructor_id) != int(request.user.pk):
            return Response(
                {"detail": "Forbidden. You can only access your assigned courses."},
                status=status.HTTP_403_FORBIDDEN
            )

        sections = (
            Section.objects.filter(
                instructor_assigned=request.user,
                loaded_course_id=loaded_course_id,
            )
            .select_related(
                "loaded_course",
                "loaded_course__academic_year",
                "loaded_course__course",
                "loaded_course__course__semester",
                "loaded_course__course__year_level",
                "loaded_course__course__program",
                "loaded_course__course__program__department",
                "loaded_course__course__program__department__college",
                "loaded_course__course__program__department__campus",
            )
        )

        if not sections.exists():
            return Response(
                {"detail": "You are not assigned to this course or any of its sections."},
                status=status.HTTP_403_FORBIDDEN
            )

        first_section = sections.first()
        course_details = InstructorCourseDetailsSerializer(first_section).data
        sections_data = InstructorSectionSerializer(sections, many=True).data

        return Response(
            {"course_details": course_details, "sections": sections_data},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Class Record
# ====================================================
def can_generate_result_sheet(section: Section) -> bool:
    loaded_course = section.loaded_course

    has_cos = CourseOutcome.objects.filter(
        loaded_course=loaded_course
    ).exists()

    has_mappings = OutcomeMapping.objects.filter(
        course_outcome__loaded_course=loaded_course
    ).exclude(outcome_mapping__isnull=True).exclude(outcome_mapping="")
    has_mappings = has_mappings.exists()

    return has_cos and has_mappings

class ClassRecordViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        try:
            section = (
                Section.objects
                .select_related("loaded_course__course__program__department")
                .prefetch_related(
                    Prefetch(
                        "courseterm_set",
                        queryset=CourseTerm.objects.prefetch_related(
                            Prefetch(
                                "courseunit_set",
                                queryset=CourseUnit.objects.prefetch_related(
                                    Prefetch(
                                        "coursecomponent_set",
                                        queryset=CourseComponent.objects.prefetch_related(
                                            Prefetch(
                                                "assessment_set",
                                                queryset=Assessment.objects.prefetch_related(
                                                    "blooms_classification",
                                                    "course_outcome",
                                                ),
                                            )
                                        ),
                                    )
                                ),
                            )
                        ),
                    ),
                    Prefetch(
                        "student_set",
                        queryset=Student.objects.prefetch_related(
                            Prefetch(
                                "rawscore_set",
                                queryset=RawScore.objects.select_related("assessment"),
                            )
                        ),
                    ),
                )
                .get(pk=pk)
            )
        except Section.DoesNotExist:
            return Response(
                {"detail": "Section not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ClassRecordSerializer(section)
        data = serializer.data
        data["canGenerateResultSheet"] = can_generate_result_sheet(section)

        return Response(data)
    
class StudentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def get_queryset(self):
        section_id = self.request.query_params.get("section")
        qs = self.queryset.select_related("section")
        if section_id:
            return qs.filter(section_id=section_id)
        return qs

    def perform_create(self, serializer):
        section_id = self.request.query_params.get("section")
        if section_id is None:
            raise serializers.ValidationError("Section is required")
        student = serializer.save(section_id=section_id)

        assessments = Assessment.objects.filter(
            course_component__course_unit__course_term__section_id=section_id
        )
        raw_scores = [
            RawScore(student=student, assessment=assessment, raw_score=0)
            for assessment in assessments
        ]
        RawScore.objects.bulk_create(raw_scores)
        return student

    @action(detail=False, methods=["post"], url_path="import")
    def import_students(self, request):
        section_id = request.query_params.get("section")
        mode = request.query_params.get("mode", "append")

        if not section_id:
            return Response({"detail": "section is required"}, status=400)

        if "file" not in request.FILES:
            return Response({"detail": "CSV file is required"}, status=400)

        file = request.FILES["file"]

        if not file.name.lower().endswith(".csv"):
            return Response({"detail": "Invalid file format. Only .csv is allowed."}, status=400)

        try:
            students_from_csv = self._parse_grade_sheet_csv(file)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        except Exception:
            return Response({"detail": "Failed to read CSV file."}, status=400)

        if not students_from_csv:
            return Response({"detail": "No student data could be extracted from CSV."}, status=400)

        filtered = []
        seen = set()
        for s in students_from_csv:
            key = (s["id_number"], s["student_name"])
            if key not in seen:
                seen.add(key)
                filtered.append(s)

        existing = Student.objects.filter(section_id=section_id).order_by("student_id")

        if mode == "append":
            return self._import_append(section_id, existing, filtered)

        if mode == "override":
            return self._import_override(section_id, existing, filtered)

        return Response({"detail": "invalid mode"}, status=400)


    def _parse_grade_sheet_csv(self, file):
        wrapper = TextIOWrapper(file, encoding="utf-8", errors="ignore")
        reader = csv.reader(wrapper)
        rows = list(reader)

        header_idx = None
        header = None

        for i, row in enumerate(rows):
            normalized = [str(c).strip().lower() for c in row]

            has_id = any(
                kw in cell for cell in normalized
                for kw in ["student no", "student number", "id number", "id no"]
            )

            has_name = any(
                kw in cell for cell in normalized
                for kw in ["full name", "student name", "name"]
            )

            if has_id and has_name:
                header_idx = i
                header = normalized
                break

        if header_idx is None:
            raise ValueError("No valid header found. Ensure the CSV contains ID and Name columns.")


        def find_col(header, keywords):
            for idx, col in enumerate(header):
                for kw in keywords:
                    if kw in col:
                        return idx
            return None

        id_col = find_col(header, ["student no", "student number", "id number", "id no"])
        name_col = find_col(header, ["full name", "student name", "name"])

        if id_col is None or name_col is None:
            raise ValueError("ID or Name column not found in CSV.")

        students = []

        for row in rows[header_idx + 1:]:
            if all(not str(c).strip() for c in row):
                break

            if len(row) <= max(id_col, name_col):
                continue

            id_number = str(row[id_col]).strip()
            student_name = str(row[name_col]).strip()

            if not id_number and not student_name:
                continue

            if id_number.lower() in ("passed:", "failed:", "incomplete:", "dropped:", "no grade:", "total"):
                continue

            students.append({
                "id_number": int(id_number) if id_number.isdigit() else None,
                "student_name": student_name,
            })

        return students

    def _import_append(self, section_id, existing_rows_qs, new_students):
        existing_rows = list(existing_rows_qs)
        section = Section.objects.get(pk=section_id)

        updated = []
        skipped = []

        db_seen = {
            (s.id_number, s.student_name)
            for s in existing_rows
            if s.id_number or s.student_name
        }

        blank_rows = [s for s in existing_rows if not s.id_number and not s.student_name]

        assessments = Assessment.objects.filter(
            course_component__course_unit__course_term__section_id=section_id
        )

        raw_scores_to_create = []

        for stu in new_students:
            key = (stu["id_number"], stu["student_name"])
            if key in db_seen:
                skipped.append(stu)
                continue

            if blank_rows:
                row = blank_rows.pop(0)
                row.id_number = stu["id_number"]
                row.student_name = stu["student_name"]
                row.save()
            else:
                if len(existing_rows) >= 40:
                    skipped.append(stu)
                    continue

                row = Student.objects.create(
                    section=section,
                    id_number=stu["id_number"],
                    student_name=stu["student_name"],
                )
                existing_rows.append(row)

                for assessment in assessments:
                    raw_scores_to_create.append(
                        RawScore(student=row, assessment=assessment, raw_score=0)
                    )

            updated.append(stu)
            db_seen.add(key)

        if raw_scores_to_create:
            RawScore.objects.bulk_create(raw_scores_to_create)

        return Response(
            {
                "mode": "append",
                "added": updated,
                "skipped": skipped,
                "detail": f"Appended {len(updated)} students (skipped {len(skipped)})",
            }
        )

    def _import_override(self, section_id, existing_rows, new_students):
        section = Section.objects.get(pk=section_id)

        Student.objects.filter(section_id=section_id).delete()

        to_import = new_students[:40]
        skipped = new_students[40:]

        if not to_import:
            return Response(
                {
                    "mode": "override",
                    "added": [],
                    "skipped": skipped,
                    "detail": "No students imported (no valid rows within 40-row cap).",
                }
            )

        assessments = Assessment.objects.filter(
            course_component__course_unit__course_term__section=section
        )

        created_students = [
            Student(
                section=section,
                id_number=stu["id_number"],
                student_name=stu["student_name"],
            )
            for stu in to_import
        ]
        Student.objects.bulk_create(created_students)

        raw_scores = [
            RawScore(student=student, assessment=assessment, raw_score=0)
            for student in created_students
            for assessment in assessments
        ]
        RawScore.objects.bulk_create(raw_scores)

        return Response(
            {
                "mode": "override",
                "added": to_import,
                "skipped": skipped,
                "detail": f"Replaced student list with {len(to_import)} entries (skipped {len(skipped)})",
            }
        )


class AssessmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    def get_queryset(self):
        qs = self.queryset.select_related("course_component")
        component_id = self.request.query_params.get("component")
        if component_id:
            return qs.filter(course_component_id=component_id)
        return qs
    
    def perform_create(self, serializer):
        assessment = serializer.save()
        section = assessment.course_component.course_unit.course_term.section
        students = Student.objects.filter(section=section)
        raw_scores = [
            RawScore(student=student, assessment=assessment, raw_score=0)
            for student in students
        ]
        RawScore.objects.bulk_create(raw_scores)
        return assessment
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assessment = self.perform_create(serializer)
        output_serializer = self.get_serializer(assessment)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="infos")
    def get_assessments_info(self, request):
        ids = request.data.get("ids", [])

        if not isinstance(ids, list) or not ids:
            return Response([], status=status.HTTP_200_OK)

        assessments = (
            Assessment.objects
            .filter(assessment_id__in=ids)
            .prefetch_related("blooms_classification", "course_outcome")
        )

        serializer = self.get_serializer(assessments, many=True)

        payload = [
            {
                "assessment_id": item["assessment_id"],
                "blooms_classification": item.get("blooms_classification", []),
                "course_outcome": item.get("course_outcome", []),
            }
            for item in serializer.data
        ]

        return Response(payload, status=status.HTTP_200_OK)
    
    def perform_update(self, serializer):
        old_highest = serializer.instance.assessment_highest_score
        assessment = serializer.save()
        new_highest = assessment.assessment_highest_score

        if old_highest != 0 and new_highest == 0:
            RawScore.objects.filter(assessment=assessment).update(raw_score=0)

        return assessment

class CourseComponentViewSet(viewsets.ModelViewSet):
    queryset = CourseComponent.objects.all()
    serializer_class = CourseComponentSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete a course component"}, status=status.HTTP_403_FORBIDDEN)

class CourseUnitViewSet(viewsets.ModelViewSet):
    queryset = CourseUnit.objects.all()
    serializer_class = CourseUnitSerializer

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Cannot delete a course unit"}, status=status.HTTP_403_FORBIDDEN)

class RawScoreUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, student_id, assessment_id):
        value = request.data.get("value")

        student = get_object_or_404(Student, pk=student_id)
        assessment = get_object_or_404(Assessment, pk=assessment_id)

        rawscore, _created = RawScore.objects.get_or_create(
            student=student,
            assessment=assessment,
            defaults={"raw_score": 0},
        )

        rawscore.raw_score = value
        rawscore.save()

        return Response(
            {
                "student_id": student_id,
                "assessment_id": assessment_id,
                "value": value,
            },
            status=status.HTTP_200_OK,
        )

# ====================================================
# Course Outcome Assessment
# ====================================================
class AssessmentPageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    BLOOM_ORDER = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]
    BLOOM_INDEX = {b: i for i, b in enumerate(BLOOM_ORDER)}

    def normalize_bloom_names(self, blooms_qs):
        if not blooms_qs:
            return "Unclassified"

        names = {b.blooms_classification_type for b in blooms_qs}
        ordered = sorted(names, key=lambda n: self.BLOOM_INDEX.get(n, 999))
        return " / ".join(ordered)

    def co_code_num(self, co_code):
        try:
            return int("".join(ch for ch in (co_code or "") if ch.isdigit()))
        except ValueError:
            return 9999

    def format_co_label(self, co_codes, course_unit_type):
        codes_sorted = sorted(co_codes, key=self.co_code_num)

        if len(codes_sorted) == 1:
            return (
                f"{codes_sorted[0]} ({course_unit_type})"
                if course_unit_type
                else codes_sorted[0]
            )

        if len(codes_sorted) == 2:
            return f"{codes_sorted[0]} & {codes_sorted[1]}"

        return f"{', '.join(codes_sorted[:-1])}, & {codes_sorted[-1]}"

    def get(self, request, section_id):
        try:
            section = (
                Section.objects
                .select_related(
                    "loaded_course__course__program__department__college__campus",
                    "loaded_course__academic_year",
                    "instructor_assigned",
                )
                .get(pk=section_id)
            )
        except Section.DoesNotExist:
            return Response({"detail": "Section not found."}, status=status.HTTP_404_NOT_FOUND)

        loaded_course = section.loaded_course
        course = loaded_course.course
        program = course.program
        academic_year = loaded_course.academic_year
        dept = getattr(program, "department", None)

        info = {
            "university_hierarchy": " / ".join([
                getattr(getattr(dept, "campus", None), "campus_name", None),
                getattr(getattr(dept, "college", None), "college_name", None),
                getattr(dept, "department_name", None),
            ]).replace("None / ", "").replace("/ None", ""),
            "program_name": getattr(program, "program_name", ""),
            "course_title": getattr(course, "course_title", ""),
            "academic_year_and_semester_type": (
                f"{academic_year.academic_year_start} - "
                f"{academic_year.academic_year_end} / "
                f"{course.semester.semester_type}"
            ),
            "instructor_assigned": (
                f"{section.instructor_assigned.first_name} {section.instructor_assigned.last_name}".strip()
                if section.instructor_assigned else ""
            ),
        }

        assessments_qs = (
            Assessment.objects
            .filter(course_component__course_unit__course_term__section=section)
            .select_related(
                "course_component__course_unit__course_term",
                "course_component__course_unit",
                "course_component",
            )
            .prefetch_related("blooms_classification", "course_outcome")
            .order_by("assessment_id")
        )

        co_qs = CourseOutcome.objects.filter(loaded_course=loaded_course)
        co_id_to_code = {co.course_outcome_id: co.course_outcome_code for co in co_qs}

        co_to_po_codes = defaultdict(set)
        mappings_qs = (
            OutcomeMapping.objects
            .filter(
                course_outcome__loaded_course=loaded_course,
                program_outcome__program=program,
                outcome_mapping__in=["I", "D", "E"],
            )
            .select_related("program_outcome", "course_outcome")
        )

        for m in mappings_qs:
            co_code = getattr(m.course_outcome, "course_outcome_code", None)
            po_code = getattr(m.program_outcome, "program_outcome_code", None)
            if co_code and po_code:
                co_to_po_codes[co_code].add(po_code)

        co_to_bloom_to_assess = defaultdict(lambda: defaultdict(list))
        assessment_ids_in_order = []

        for a in assessments_qs:
            unit_type = getattr(a.course_component.course_unit, "course_unit_type", None)

            a_co_codes = [
                co_id_to_code.get(co.course_outcome_id)
                for co in a.course_outcome.all()
                if co.loaded_course_id == loaded_course.loaded_course_id
            ]

            if not a_co_codes:
                assessment_ids_in_order.append(a.assessment_id)
                continue

            co_label = self.format_co_label([c for c in a_co_codes if c], unit_type)
            bloom_key = self.normalize_bloom_names(list(a.blooms_classification.all()))

            co_to_bloom_to_assess[co_label][bloom_key].append({
                "assessment_id": a.assessment_id,
                "assessment_title": a.assessment_title,
                "assessment_highest_score": a.assessment_highest_score,
            })

            assessment_ids_in_order.append(a.assessment_id)

        po_to_co_map = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

        for co_label, bloom_map in co_to_bloom_to_assess.items():
            base_label = co_label.split(" (")[0]
            co_codes = [c.strip() for c in base_label.replace("&", ",").split(",") if c.strip()]

            merged_po_codes = set()
            for co_code in co_codes:
                merged_po_codes |= co_to_po_codes.get(co_code, set())

            po_key = ", ".join(sorted(merged_po_codes)) if merged_po_codes else ""

            for bloom_label, assessments in bloom_map.items():
                po_to_co_map[po_key][base_label][bloom_label].extend(assessments)

        course_outcomes_payload = []
        for po_key, co_groups in po_to_co_map.items():
            co_entries = []

            for co_code, blooms in sorted(co_groups.items(), key=lambda x: self.co_code_num(x[0])):
                lec_lab_variants = defaultdict(lambda: defaultdict(list))

                for bloom_label, assessments in blooms.items():
                    for a in assessments:
                        unit_type = getattr(
                            Assessment.objects.get(pk=a["assessment_id"]).course_component.course_unit,
                            "course_unit_type",
                            None,
                        )
                        label = f"{co_code} ({unit_type})" if unit_type else co_code
                        lec_lab_variants[label][bloom_label].append(a)

                variant_entries = []
                for variant_label, bloom_map in lec_lab_variants.items():

                    bloom_entry_dict = {
                        bk: bloom_map[bk]
                        for bk in sorted(
                            bloom_map.keys(),
                            key=lambda k: self.BLOOM_INDEX.get(k.split(" / ")[0], 999)
                        )
                    }

                    variant_entries.append({
                        variant_label: [{"blooms_classification": [bloom_entry_dict]}]
                    })

                co_entries.append({co_code: variant_entries})

            course_outcomes_payload.append({
                po_key or "": [{"course_outcomes": co_entries}]
            })

        assessments_payload = [{"program_outcomes": course_outcomes_payload}]

        students_qs = (
            Student.objects
            .filter(section=section)
            .annotate(name_lower=Lower("student_name"))
            .order_by("name_lower", "student_id")
        )

        raw_scores_qs = RawScore.objects.filter(
            assessment__in=assessments_qs
        ).select_related("assessment", "student")

        scores_by_student = defaultdict(dict)
        for rs in raw_scores_qs:
            scores_by_student[rs.student_id][rs.assessment.assessment_id] = rs.raw_score

        seen = set()
        ordered_assessment_ids = []
        for aid in assessment_ids_in_order:
            if aid not in seen:
                seen.add(aid)
                ordered_assessment_ids.append(aid)

        students_list = [{
            "student_id": s.student_id,
            "id_number": s.id_number,
            "student_name": s.student_name,
            "remarks": s.remarks,
            "scores": [
                {"assessment_id": aid, "value": scores_by_student.get(s.student_id, {}).get(aid)}
                for aid in ordered_assessment_ids
            ],
        } for s in students_qs]

        response = {
            "info": info,
            "assessments": assessments_payload,
            "students": students_list,
        }

        return Response(response, status=status.HTTP_200_OK)

# ====================================================
# Course Outcomes
# ====================================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def course_outcome_list_create_view(request, loaded_course_id):
    try:
        if request.method == "GET":
            outcomes = CourseOutcome.objects.filter(loaded_course_id=loaded_course_id).order_by("course_outcome_id")
            serializer = CourseOutcomeSerializer(outcomes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        try:
            loaded_course = LoadedCourse.objects.get(pk=loaded_course_id)
        except LoadedCourse.DoesNotExist:
            return Response({"message": "Loaded course not found"}, status=status.HTTP_404_NOT_FOUND)

        last_outcome = CourseOutcome.objects.filter(loaded_course=loaded_course).order_by("course_outcome_id").last()

        if last_outcome:
            last_num = int(last_outcome.course_outcome_code.replace("CO", ""))
            next_num = last_num + 1
        else:
            next_num = 1

        next_code = f"CO{next_num}"

        serializer = CourseOutcomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(loaded_course=loaded_course, course_outcome_code=next_code)
            return Response(
                {"message": "Course Outcome added successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def course_outcome_detail_view(request, outcome_id):
    try:
        try:
            outcome = CourseOutcome.objects.get(pk=outcome_id)
        except CourseOutcome.DoesNotExist:
            return Response({"message": "Course Outcome not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.method == "PUT":
            serializer = CourseOutcomeSerializer(outcome, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"message": "Course Outcome updated successfully", "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        latest = CourseOutcome.objects.filter(loaded_course=outcome.loaded_course).order_by("course_outcome_id").last()
        if latest and latest.pk == outcome.pk:
            outcome.delete()
            return Response({"message": "Course Outcome deleted successfully"}, status=status.HTTP_200_OK)
        return Response(
            {"message": "Only the latest Course Outcome can be deleted"},
            status=status.HTTP_403_FORBIDDEN,
        )

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ====================================================
# Outcome Mapping
# ====================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def outcome_mapping_view(request, loaded_course_id):
    try:
        course_outcomes = CourseOutcome.objects.filter(loaded_course_id=loaded_course_id)
        
        if not course_outcomes.exists():
            loaded_course = LoadedCourse.objects.filter(pk=loaded_course_id).select_related("course__program").first()
            program_outcomes = []
            if loaded_course and loaded_course.course.program:
                program_outcomes = ProgramOutcome.objects.filter(program=loaded_course.course.program)
            return Response({
                "program_outcomes": ProgramOutcomeSerializer(program_outcomes, many=True).data,
                "course_outcomes": [],
                "mapping": [],
            }, status=status.HTTP_200_OK)

        program = course_outcomes.first().loaded_course.course.program
        program_outcomes = ProgramOutcome.objects.filter(program=program)

        if program_outcomes.exists() and course_outcomes.exists():
            for co in course_outcomes:
                for po in program_outcomes:
                    OutcomeMapping.objects.get_or_create(program_outcome=po, course_outcome=co)

        mappings = OutcomeMapping.objects.filter(
            program_outcome__in=program_outcomes,
            course_outcome__in=course_outcomes,
        )

        return Response({
            "program_outcomes": ProgramOutcomeSerializer(program_outcomes, many=True).data,
            "course_outcomes": CourseOutcomeSerializer(course_outcomes, many=True).data,
            "mapping": OutcomeMappingSerializer(mappings, many=True).data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_outcome_mapping(request, pk):
    try:
        mapping = OutcomeMapping.objects.get(pk=pk)
        value = request.data.get("outcome_mapping", "").strip().upper()
        if value not in ["", "I", "D", "E"]:
            return Response({"detail": "Invalid mapping value. Must be '', 'I', 'D', or 'E'."},
                            status=status.HTTP_400_BAD_REQUEST)
        mapping.outcome_mapping = value if value else None
        mapping.save()
        return Response(OutcomeMappingSerializer(mapping).data, status=status.HTTP_200_OK)
    except OutcomeMapping.DoesNotExist:
        return Response({"detail": "Mapping not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# ====================================================
# Course Syllabus Data Extraction
# ====================================================
class SyllabusExtractView(APIView):
    def post(self, request, loaded_course_id: int):
        try:
            loaded_course = LoadedCourse.objects.select_related(
                "course__program"
            ).get(pk=loaded_course_id)
        except LoadedCourse.DoesNotExist:
            return Response(
                {"error": "Loaded course not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if "file" not in request.FILES:
            return Response({"detail": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        pdf_file = request.FILES["file"]

        tmp_name = f"tmp/{uuid.uuid4().hex}_{pdf_file.name}"
        path = default_storage.save(tmp_name, pdf_file)
        filepath = default_storage.path(path)

        try:
            result = extract_co_po(filepath)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:

            try:
                if default_storage.exists(path):
                    default_storage.delete(path)
            except Exception:
                pass