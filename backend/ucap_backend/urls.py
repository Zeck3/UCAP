from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

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
    # ====================================================
    # Course Management
    # ====================================================
    path("admin/course_management/", course_management_view),
    path("admin/course_management/<str:course_code>", course_detail_view),
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
    # # ============================================================================================================================
    # path("instructor/course_dashboard/<int:instructor_id>/display_courses/", instructor_courses,),
    # path("instructor/course_dashboard/<int:instructor_id>/<str:loaded_course_id>/display_sections/", instructor_sections,),
    # path("instructor/course_dashboard/<int:instructor_id>/display_course_information/", instructor_course_information,),  # for Instructor Dashboard
    # # ============================================================================================================================
    # path("admin/course_management/section/create_section/", create_section),
    # # path('department_chair/course_management/<str:course_code>/load_course/', load_course),
    # path("department_chair/course_management/<int:department_id>/courses/", get_department_courses,),
    # path("department_chair/course_management/<int:department_id>/<str:course_code>/sections/", get_department_course_sections,),
    # path("department_chair/course_management/<int:department_id>/instructors/", get_department_instructors,),
    # path("department_chair/course_management/section/<int:section_id>/assign_instructor/", assign_instructor,),
]
