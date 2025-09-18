from django.urls import path
from .views import *

urlpatterns = [
    path('hello/', hello_view),
#============================================================================================================================
    path('login/', login_authentication),  
#== Admin Management ========================================================================================================
    path('admin/user_management/roles/', get_roles),                                                                                # To be checked
    path('admin/user_management/departments/', get_departments),  
    path('admin/course_management/programs/', get_programs), 
    path('admin/course_management/year_levels/', get_year_levels),
    path('admin/course_management/semesters/', get_semesters),
    path('admin/course_management/credits/', get_credits),
    path('admin/course_management/academic_years/', get_academic_years),    
#============================================================================================================================
    path('admin/user_management/faculty/', get_faculty),  
    path('admin/user_management/course_list/', get_courses),
#============================================================================================================================
    path('admin/course_management/create_course/', create_course), 
    path('admin/course_management/<str:course_code>/update_course/', update_course),
    path('admin/course_management/<str:course_code>/delete_course/', delete_course),
    path('admin/user_management/create_user/', user_registration), 
    path('admin/user_management/<int:user_id>/update_user/', update_user),
    path('admin/user_management/<int:user_id>/delete_user/', delete_user),
#============================================================================================================================
    path('admin/course_management/campus/', get_campus),     
    path('admin/course_management/colleges/', get_colleges), 
#============================================================================================================================     
    path('instructor/course_dashboard/<int:instructor_id>/display_courses/', instructor_courses),                                   # To be checked
    path('instructor/course_dashboard/<int:instructor_id>/<str:loaded_course_id>/display_sections/', instructor_sections),          # To be checked
    path('instructor/course_dashboard/<int:instructor_id>/display_course_information/', instructor_course_information),
#============================================================================================================================
    path('admin/course_management/section/create_section/', create_section), 
    #path('department_chair/course_management/<str:course_code>/load_course/', load_course),

    path('department_chair/course_management/<int:department_id>/courses/', get_department_courses),                                # To be checked
    path('department_chair/course_management/<int:department_id>/<str:course_code>/sections/', get_department_course_sections),     # To be checked
    path('department_chair/course_management/<int:department_id>/instructors/', get_department_instructors),                        # To be checked
    path('department_chair/course_management/section/<int:section_id>/assign_instructor/', assign_instructor),                      # To be checked
    
]