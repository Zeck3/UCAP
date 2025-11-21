import os

SECRET_KEY = "dummy"
DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    'django.contrib.sessions', 
    "corsheaders",
    "ucap_backend",
    "rest_framework",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
]

CORS_ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:4173"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:5173", "http://localhost:4173"]
CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = "ucap_backend.User"

ROOT_URLCONF = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"

SESSION_COOKIE_AGE = 900
SESSION_SAVE_EVERY_REQUEST = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT"),
    }
}

STATIC_URL = "/static/"