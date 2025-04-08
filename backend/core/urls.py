from django.urls import path
from django.http import JsonResponse

def api_hello(request):
    return JsonResponse({'message': 'Hello from Django!'})

urlpatterns = [
    path('api/hello/', api_hello),
]
