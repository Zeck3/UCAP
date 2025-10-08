from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'instructor/students', StudentViewSet, basename='student')
router.register(r'instructor/assessments', AssessmentViewSet, basename='assessment')
router.register(r'instructor/course-components', CourseComponentViewSet, basename='course-component')
router.register(r'instructor/course-units', CourseUnitViewSet, basename='course-unit')
router.register(r'instructor/class-record', ClassRecordViewSet, basename='class-record')

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
    path('', include(router.urls)),
    path('instructor/rawscores/<int:student_id>/<int:assessment_id>/', RawScoreUpdateView.as_view(), name='rawscore-update'),
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
    # # ============================================================================================================================
    # path("admin/course_management/section/create_section/", create_section),
    # # path('department_chair/course_management/<str:course_code>/load_course/', load_course),

    # ====================================================
    # Department Chair Dashboard
    # ====================================================
    path("department_chair/department_details/<int:department_id>/", get_department_details_view),
    path("department_chair/course_details/<int:department_id>/<int:loaded_course_id>/", get_department_course_details_view),

    path("department_chair/course_management/<int:department_id>/", get_department_loaded_courses_view,),

    path("department_chair/sections/<int:department_id>/<int:loaded_course_id>/", get_department_course_sections_view,),
    path("department_chair/not_loaded_courses/<int:department_id>/", get_department_courses_view),
    
    path("department_chair/delete_section/<int:loaded_course_id>/<int:section_id>/", delete_department_section),
    path("department_chair/delete_loaded_course/<int:loaded_course_id>/", delete_loaded_course),

    path("department_chair/load_department_courses/", load_course),
    path("department_chair/section_management/", section_management),


    # ====================================================
    # Department Path
    # ====================================================
    path("department_chair/sections/<int:departmentId>/", department_path_view),
]
