from django.urls import path
from .views import hello_view, user_registration, get_roles, login_view

urlpatterns = [
    path('hello/', hello_view),
    path('register/', user_registration),
    path('roles/', get_roles),
    path('login/', login_view),  # Ensure this is included
]   