from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="student")
router.register(r"assessments", AssessmentViewSet, basename="assessment")
router.register(r"course_components", CourseComponentViewSet, basename="course_component")
router.register(r"course_units", CourseUnitViewSet, basename="course_unit")
router.register(r"class_record", ClassRecordViewSet, basename="class_record")

urlpatterns = [
    # ====================================================
    # Login Authentication
    # ====================================================
    path("csrf/", csrf_token_view),
    path("login/", login_view),
    path("logout/", logout_view, name="logout"), 
    path("me/", me_view, name="current_user"),
    path("heartbeat/", heartbeat_view),
    # ====================================================
    # User Management
    # ====================================================
    path("admin/user_management/", user_management_view),
    path("admin/user_management/<int:user_id>", user_detail_view),
    # ================================d====================
    # Course Management
    # ====================================================
    path("admin/course_management/", course_management_view),
    path("admin/course_management/<str:course_code>", course_detail_view),
    # ====================================================
    # Instructor Dashboard
    # ====================================================
    path("instructor/<int:instructor_id>/", instructor_loaded_courses_view,),
    path("instructor/<int:instructor_id>/<str:loaded_course_id>", instructor_assigned_sections_view,),
    # ====================================================
    # Class Record
    # ====================================================
    path("instructor/", include(router.urls)),
    path("instructor/rawscores/<int:student_id>/<int:assessment_id>/", RawScoreUpdateView.as_view()),
    # ====================================================
    # Assessment Page
    # ====================================================
    path("assessments/<int:section_id>/", AssessmentPageAPIView.as_view()),
    # ====================================================
    # Department Chair Dashboard
    # ====================================================
    path("department_chair/department_detail/<int:department_id>/", department_detail_view),

    path("department_chair/department_course_management/<int:department_id>/", department_course_management_view),
    path("department_chair/department_course_management/<int:department_id>/<int:loaded_course_id>/", department_course_detail_view),

    path("department_chair/department_section_management/<int:department_id>/<int:loaded_course_id>/", department_section_management_view),
    path("department_chair/department_section_management/<int:department_id>/<int:loaded_course_id>/<int:section_id>/", department_section_detail_view),
    # ====================================================
    # Dropdown
    # ====================================================
    path("user_role/", user_role_list_view),
    path("department/", department_list_view),
    path("program/", program_list_view),
    path("year_level/", year_level_list_view),
    path("semester/", semester_list_view),
    path("credit_unit/", credit_unit_list_view),
    path("academic_year/", academic_year_list_view),
    path("instructors/", instructor_list_view),
    path("blooms_classification/", blooms_classification_list_view),
    path("course_outcomes/<str:course_code>", course_outcome_list_view),
    # ====================================================
    # User Department
    # ====================================================
    path("user/<int:departmentId>/", user_department_view),
]
