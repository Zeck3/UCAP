from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("csrf/", csrf_token_view),
    path("login/", login_view),
    path("logout/", logout_view, name="logout"), 
    path("me/", me_view, name="current_user"),
    path("heartbeat/", heartbeat_view),
    # == Admin Management ========================================================================================================
    path("admin/course_management/departments/", get_departments),
    path("admin/course_management/programs/", get_programs),
    path("admin/course_management/year_levels/", get_year_levels),
    path("admin/course_management/semesters/", get_semesters),
    path("admin/course_management/credits/", get_credits),
    path("admin/course_management/academic_years/", get_academic_years),
    path("admin/course_management/campus/", get_campus),
    path("admin/course_management/colleges/", get_colleges),
    # ============================================================================================================================
    path("admin/course_management/create_course/", create_course),
    path("admin/course_management/<str:course_code>/update_course/", update_course),
    path("admin/course_management/<str:course_code>/delete_course/", delete_course),
    path("admin/faculty_management/create_faculty/", faculty_registration),
    path("admin/faculty_management/<int:user_id>/update_faculty/", update_faculty),
    path("admin/faculty_management/<int:user_id>/delete_faculty/", delete_faculty),
    # ============================================================================================================================
    path("admin/faculty_management/roles/", get_roles),
    path("admin/faculty_management/faculty/", get_faculty),
    path("admin/faculty_management/course_list/", get_courses),
    # ============================================================================================================================
    path("instructor/course_dashboard/<int:instructor_id>/display_courses/", instructor_courses,),
    path("instructor/course_dashboard/<int:instructor_id>/<str:loaded_course_id>/display_sections/", instructor_sections,),
    path("instructor/course_dashboard/<int:instructor_id>/display_course_information/", instructor_course_information,),  # for Instructor Dashboard
    # ============================================================================================================================
    path("admin/course_management/section/create_section/", create_section),
    # path('department_chair/course_management/<str:course_code>/load_course/', load_course),
    path("department_chair/course_management/<int:department_id>/courses/", get_department_courses,),
    path("department_chair/course_management/<int:department_id>/<str:course_code>/sections/", get_department_course_sections,),
    path("department_chair/course_management/<int:department_id>/instructors/", get_department_instructors,),
    path("department_chair/course_management/section/<int:section_id>/assign_instructor/", assign_instructor,),
]
