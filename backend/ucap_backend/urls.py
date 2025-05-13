from django.urls import path
from .views import *

urlpatterns = [
    path('hello/', hello_view),
    path('register/', user_registration),
    path('roles/', get_roles),
    path('login/', login_view),  # Ensure this is included
    path('admin/course_management/instructors/', get_intructors),  # Instructor list
    path('admin/course_management/campus/', get_campus),  # Campus list
]   