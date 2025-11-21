from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "dummy")

DEBUG = os.environ.get("DEBUG", "False") == "True"

RAILWAY_BACKEND_DOMAIN = os.environ.get("BACKEND_DOMAIN", "")
RAILWAY_FRONTEND_DOMAIN = os.environ.get("FRONTEND_DOMAIN", "")

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

if RAILWAY_BACKEND_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_BACKEND_DOMAIN)

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.staticfiles",
    "django.contrib.sessions",
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

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:4173",
]

if RAILWAY_FRONTEND_DOMAIN:
    CORS_ALLOWED_ORIGINS.append(f"https://{RAILWAY_FRONTEND_DOMAIN}")
    CSRF_TRUSTED_ORIGINS.append(f"https://{RAILWAY_FRONTEND_DOMAIN}")

CORS_ALLOW_CREDENTIALS = True

AUTH_USER_MODEL = "ucap_backend.User"

ROOT_URLCONF = "core.urls"
WSGI_APPLICATION = "core.wsgi.application"

SESSION_COOKIE_AGE = 900
SESSION_SAVE_EVERY_REQUEST = True

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("PGDATABASE"),
        "USER": os.environ.get("PGUSER"),
        "PASSWORD": os.environ.get("PGPASSWORD"),
        "HOST": os.environ.get("PGHOST"),
        "PORT": os.environ.get("PGPORT"),
    }
}

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")
