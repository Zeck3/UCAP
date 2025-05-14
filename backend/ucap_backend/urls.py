from django.urls import path
from .views import *

urlpatterns = [
    path('hello/', hello_view),
    path('login/', login_view),  # Ensure this is included
    path('admin/user_management/create_user', user_registration),
    path('admin/course_management/roles/', get_roles),  # Role list
    path('admin/course_management/instructors/', get_intructors),  # Instructor list
    path('admin/course_management/campus/', get_campus),  # Campus list
    path('admin/course_management/colleges/', get_colleges),  # College list
    path('admin/course_management/departments/', get_departments),  # Department list
    path('admin/course_management/programs/', get_programs),  # Program list
    path('admin/course_management/academic_years/', get_academic_years),  # Academic Year list
    path('admin/course_management/credits/', get_credits),  # Credit list
    path('admin/course_management/semesters/', get_semesters),  # Semester list

]   