from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ucap_backend.views.admin import user_detail_view, user_management_view
from ucap_backend.views.base import CollegeViewSet, DepartmentViewSet, ProgramViewSet, academic_year_list_view, blooms_classification_list_view, campus_list_view, course_outcome_list_view, credit_unit_list_view, instructor_list_view, semester_list_view, user_role_list_view, year_level_list_view
from ucap_backend.views.dean import dean_course_page_view, dean_loaded_courses_view
from ucap_backend.views.department_chair import dc_course_detail_view, dc_course_management_view, department_course_detail_view, department_course_list_view, department_course_management_view, department_section_detail_view, department_section_management_view, program_outcome_detail_view, program_outcome_list_create_view
from ucap_backend.views.instructor import AssessmentPageAPIView, AssessmentViewSet, ClassRecordViewSet, CourseComponentViewSet, CourseUnitViewSet, RawScoreUpdateView, StudentViewSet, SyllabusExtractView, course_outcome_detail_view, course_outcome_list_create_view, instructor_assigned_sections_view, instructor_loaded_courses_view, nlp_outcome_mapping_view, outcome_mapping_view, update_outcome_mapping
from ucap_backend.views.user import change_password_view, csrf_token_view, heartbeat_view, login_view, logout_view, me_view, user_initial_info_view
from ucap_backend.views.vcaa import vcaa_course_page_view, vcaa_loaded_courses_view
from ucap_backend.views.vpaa import vpaa_course_page_view, vpaa_loaded_courses_view

instructor_router = DefaultRouter()
instructor_router.register(r"students", StudentViewSet, basename="student")
instructor_router.register(r"assessments", AssessmentViewSet, basename="assessment")
instructor_router.register(r"course_components", CourseComponentViewSet, basename="course_component")
instructor_router.register(r"course_units", CourseUnitViewSet, basename="course_unit")
instructor_router.register(r"class_record", ClassRecordViewSet, basename="class_record")

core_router = DefaultRouter()
core_router.register(r"college", CollegeViewSet, basename="college")
core_router.register(r"department", DepartmentViewSet, basename="department")
core_router.register(r"program", ProgramViewSet, basename="program")

urlpatterns = [
    # ====================================================
    # Login Authentication
    # ====================================================
    path("csrf/", csrf_token_view),
    path("login/", login_view),
    path("logout/", logout_view, name="logout"), 
    path("me/", me_view, name="current_user"),
    path("heartbeat/", heartbeat_view),
    path("change-password/", change_password_view),
    # ====================================================
    # User Management
    # ====================================================
    path("admin/user_management/", user_management_view),
    path("admin/user_management/<int:user_id>", user_detail_view),
    # ====================================================
    # Hierarchy Management
    # ====================================================
    path("admin/", include(core_router.urls)),
    # ====================================================
    # Instructor Dashboard
    # ====================================================
    path("instructor/<int:instructor_id>/", instructor_loaded_courses_view,),
    path("instructor/<int:instructor_id>/<str:loaded_course_id>", instructor_assigned_sections_view,),

    path("instructor/course_outcomes_management/<int:loaded_course_id>/", course_outcome_list_create_view),
    path("instructor/course_outcomes_management/detail/<int:outcome_id>/", course_outcome_detail_view),

    path("instructor/outcome_mapping_management/<int:loaded_course_id>/", outcome_mapping_view),
    path("instructor/outcome_mapping_management/update/<int:pk>/", update_outcome_mapping),

    path("instructor/<int:loaded_course_id>/extract-syllabus/", SyllabusExtractView.as_view(),),
    path("instructor/nlp_outcome_mapping/<int:loaded_course_id>/", nlp_outcome_mapping_view),
    # ====================================================
    # Class Record
    # ====================================================
    path("instructor/", include(instructor_router.urls)),
    path("instructor/rawscores/<int:student_id>/<int:assessment_id>/", RawScoreUpdateView.as_view()),
    # ====================================================
    # Assessment Page
    # ====================================================
    path("assessments/<int:section_id>/", AssessmentPageAPIView.as_view()),
    # ====================================================
    # Department Chair Dashboard
    # ====================================================
    path("department_chair/department_course_list/<int:department_id>/", department_course_list_view),

    path("department_chair/course_management/<int:department_id>/", dc_course_management_view ),
    path("department_chair/course_management/<int:department_id>/<str:course_code>", dc_course_detail_view),

    path("department_chair/department_course_management/<int:department_id>/", department_course_management_view),
    path("department_chair/department_course_management/delete/<int:loaded_course_id>/", department_course_detail_view),

    path("department_chair/section_management/loaded_course/<int:loaded_course_id>/", department_section_management_view),
    path("department_chair/section_management/section/<int:section_id>/",department_section_detail_view),

    path("department_chair/program_outcomes_management/<int:program_id>/", program_outcome_list_create_view),
    path("department_chair/program_outcomes_management/detail/<int:outcome_id>/", program_outcome_detail_view),
    # ====================================================
    # Dean
    # ====================================================
    path("dean/<int:college_id>/", dean_loaded_courses_view),
    path("dean/loaded_course/<int:loaded_course_id>/", dean_course_page_view),
    # ====================================================
    # VCAA 
    # ====================================================
    path("campus/<int:campus_id>/", vcaa_loaded_courses_view),
    path("campus/loaded_course/<int:loaded_course_id>/", vcaa_course_page_view),
    # ====================================================
    # VPAA
    # ====================================================
    path("university/", vpaa_loaded_courses_view),
    path("university/loaded_course/<int:loaded_course_id>/", vpaa_course_page_view),
    # ====================================================
    # Dropdown
    # ====================================================
    path("user_role/", user_role_list_view),
    path("campus/", campus_list_view),
    path("year_level/", year_level_list_view),
    path("semester/", semester_list_view),
    path("credit_unit/", credit_unit_list_view),
    path("academic_year/", academic_year_list_view),
    path("instructors/", instructor_list_view),
    path("blooms_classification/", blooms_classification_list_view),
    path("course_outcomes/<int:loaded_course_id>", course_outcome_list_view),
    # ====================================================
    # User Department
    # ====================================================
    path("user/initial-info/", user_initial_info_view),
]
