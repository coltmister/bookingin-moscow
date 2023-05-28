import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')

PRODUCTION = True if os.getenv('PRODUCTION') == 'True' else False

DEBUG = True if os.getenv('DEBUG') == 'True' else False

# CORS
ALLOWED_HOSTS = json.loads(os.getenv('ALLOWED_HOSTS'))
CSRF_TRUSTED_ORIGINS = json.loads(os.getenv('CSRF_TRUSTED_ORIGINS'))
CORS_ALLOW_ALL_ORIGINS = True

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    'django_celery_beat',
    'django_celery_results',
    'django.contrib.gis',
    'django_filters',
    'corsheaders',
    'core',
    'users',
    'iam',
    'booking',
    'site_territory'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'settings.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

WSGI_APPLICATION = 'settings.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': os.getenv('DATABASE_ENGINE'),
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('DATABASE_HOST'),
        'PORT': os.getenv('DATABASE_PORT'),
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.0/topics/i18n/


LOG_FILE = os.getenv('LOG_FILE')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'high': {
            'format': '{asctime} {levelname} {name} [line {lineno}] {message}',
            'style': '{',
        },
        'low': {
            'format': '{asctime} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'formatter': 'high',
            'filename': LOG_FILE,
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'high'
        },
    },
    'loggers': {
        'core': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
        },
        'corp': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
        },
        'celery': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True
        },

    }
}

LANGUAGE_CODE = 'ru-ru'

TIME_ZONE = 'Europe/Moscow'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# STATICFILES_DIRS = [
#     "/var/static"
# ]

STATIC_URL = '/api/static/'
STATIC_ROOT = '/var/www/html/static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'EXCEPTION_HANDLER': 'core.utils.exceptions.api_exception_handler'
}

CELERY_TIMEZONE = 'Europe/Moscow'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 90 * 60
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'django-cache'
DJANGO_CELERY_BEAT_TZ_AWARE = True

# CELERY_BEAT_SCHEDULE = {
#     'update_calendars': {
#         'task': 'booking.booking.tasks.update_calendars',
#         'schedule': datetime.timedelta(seconds=60)
#     }
# }

TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
DEBUG_CHAT_ID = os.getenv('DEBUG_CHAT_ID')

CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
MASTER_REALM_ENDPOINT = os.getenv('MASTER_REALM_ENDPOINT')
USER_INFO_ENDPOINT = os.getenv('USER_INFO_ENDPOINT')

AUTHORIZATION_ENDPOINT = os.getenv('AUTHORIZATION_ENDPOINT')
USERS_ENDPOINT = os.getenv('USERS_ENDPOINT')
REDIRECT_URI = os.getenv('REDIRECT_URI')
ADMIN_URL = os.getenv('ADMIN_URL')
ACCOUNT_SESSION_URL = os.getenv('ACCOUNT_SESSION_URL')
ADMIN_SESSION_URL = os.getenv('ADMIN_SESSION_URL')
END_SESSION_ENDPOINT = os.getenv('END_SESSION_ENDPOINT')
JWT_HASH = os.getenv('JWT_HASH')

KEYCLOAK_COOKIE_PATH = os.getenv('KEYCLOAK_COOKIE_PATH')
KEYCLOAK_COOKIE_EXPIRES_MIN = os.getenv('KEYCLOAK_COOKIE_EXPIRES_MIN')
FRONT_URL = os.getenv('FRONT_URL')
FRONT_LOGIN_URL = os.getenv('FRONT_LOGIN_URL')
IMPERSONATION_URL = os.getenv('IMPERSONATION_URL')

S3_SERVER = os.getenv('S3_SERVER')
S3_ACCESS_KEY = os.getenv('S3_ACCESS_KEY')
S3_SECRET_KEY = os.getenv('S3_SECRET_KEY')
S3_DOCS_BUCKET = os.getenv('S3_DOCS_BUCKET')
S3_USER_PHOTO_BUCKET = os.getenv('S3_USER_PHOTO_BUCKET')
S3_SITE_DOCS_BUCKET = os.getenv('S3_SITE_DOCS_BUCKET')
S3_CALENDARS_BUCKET = os.getenv('S3_CALENDARS_BUCKET')
HOST = os.getenv('HOST')

EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = os.getenv('EMAIL_PORT')
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

SIMPLECLOUD_URL = os.getenv('SIMPLECLOUD_URL')
SIMPLECLOUD_TOKEN = os.getenv('SIMPLECLOUD_TOKEN')

DADATA_API = os.getenv('DADATA_API')
DADATA_SECRET = os.getenv('DADATA_SECRET')

MOS_API = os.getenv('MOS_API')

OPEN_AI_API = os.getenv('OPEN_AI_API')

CALL_URL = os.getenv('CALL_URL')
CALL_TOKEN = os.getenv('CALL_TOKEN')
