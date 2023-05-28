import datetime
import functools
import json
import logging
import time
import traceback
import warnings
from base64 import b64decode

import jwt
import requests
from cryptography.hazmat.primitives import serialization
from django.core.cache import CacheKeyWarning
from django.core.exceptions import ObjectDoesNotExist
from django.db import connection, reset_queries
from django.http import HttpResponse, JsonResponse
from django.utils import timezone

from core.models import Metric
from core.utils.http import Response
from core.utils.notification import telegram_message
from iam.models import LogoutUser
from iam.registration import UserData
from settings.settings import PRODUCTION, MASTER_REALM_ENDPOINT, JWT_HASH, DEBUG
from users.models import User

warnings.simplefilter("ignore", CacheKeyWarning)

logger = logging.getLogger(__name__)

KEYCLOAK_PUBLIC_KEY = serialization.load_der_public_key(
    b64decode(requests.get(MASTER_REALM_ENDPOINT).json()['public_key'].encode()))


def admin_only(called_func):
    def wrap(request, *args, **kwargs):
        if kwargs.get('is_admin') is True:
            return called_func(request, *args, **kwargs)
        else:
            return Response(content="Данное действие доступно только администратору", status=400)

    return wrap


def auth(called_func):
    """
    Декоратор, проверяющий access_token пользователя
    468 - Refresh Token
    401 - Разлогинить пользователя
    """

    def wrap(request, *args, **kwargs):
        if 'Authorization' not in request.headers:
            return Response(status=400, content="Отсутствует Authorization")
        access_token = request.headers['Authorization']
        if 'Bearer' not in access_token:
            return Response(status=468, content={"status": "error", "message": "Обновите токен"})

        access_token = access_token.split()[-1]

        try:
            # Офлайн проверка валидности токена
            userinfo = jwt.decode(jwt=access_token,
                                  key=KEYCLOAK_PUBLIC_KEY,
                                  algorithms=[JWT_HASH],
                                  audience='account')
        except jwt.exceptions.PyJWTError:
            return Response(status=468, content={"status": "error", "message": "Обновите токен+"})

        if 'error' in userinfo:
            return Response(status=401, content={"status": "error", "message": "Войдите заново"})

        kwargs['user_session_id'] = userinfo['sid']
        user_session_id = str(kwargs['user_session_id'])
        kwargs['access_token'] = access_token
        kwargs['userinfo'] = userinfo
        kwargs['username'] = userinfo['preferred_username']
        user_id = userinfo['sub']
        kwargs['user_id'] = user_id
        token_iat = userinfo['iat']

        try:
            user = User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            user = UserData.register(userinfo)

        if not user.is_active:
            return Response(status=401, content="Ваш аккаунт заблокирован, свяжитесь с администратором")

        kwargs['user'] = user
        kwargs['role'] = user.role

        # Проверка, что текущую сессию пользователя необходимо завершить
        session_logout = LogoutUser.objects.filter(user=user.id, session_id=user_session_id)
        if session_logout.exists():
            session_logout = session_logout.last()
            if session_logout.logout_type == LogoutUser.REFRESH_TOKEN:
                status_code = 468
                message = "Обновите токен"
            elif session_logout.logout_type == LogoutUser.LOGOUT:
                status_code = 401
                message = "Войдите заново"
            else:
                status_code = 468
                message = "Обновите токен"
            return Response(status=status_code, content={"status": "error", "message": message})

        token_iat_datetime = datetime.datetime.fromtimestamp(token_iat, tz=timezone.get_default_timezone())
        # Проверка, что все соединения пользователя необходимо завершить
        user_logout = LogoutUser.objects.filter(user=user.id,
                                                session_id=None,
                                                logout_type=LogoutUser.LOGOUT,
                                                iat_before__gt=token_iat_datetime)
        if user_logout.exists():
            return Response(status=401, content={"status": "error", "message": "Войдите заново"})

        # Проверка, что все соединения пользователя необходимо обновить (запросить токен заново)
        user_refresh_token = LogoutUser.objects.filter(user=user.id,
                                                       session_id=None,
                                                       logout_type=LogoutUser.REFRESH_TOKEN,
                                                       iat_before__gt=token_iat_datetime)
        if user_refresh_token.exists():
            return Response(status=468, content={"status": "error", "message": "Обновите токен"})

        return called_func(request, *args, **kwargs)

    return wrap



def auth_anon(called_func):
    """
    Декоратор, проверяющий access_token пользователя
    468 - Refresh Token
    401 - Разлогинить пользователя
    """

    def wrap(request, *args, **kwargs):
        if 'Authorization' not in request.headers:
            kwargs['is_anonymous'] = True
            return called_func(request, *args, **kwargs)

        access_token = request.headers['Authorization']
        if 'Bearer' not in access_token:
            return Response(status=468, content={"status": "error", "message": "Обновите токен"})

        access_token = access_token.split()[-1]

        try:
            # Офлайн проверка валидности токена
            userinfo = jwt.decode(jwt=access_token,
                                  key=KEYCLOAK_PUBLIC_KEY,
                                  algorithms=[JWT_HASH],
                                  audience='account')
        except jwt.exceptions.PyJWTError:
            return Response(status=468, content={"status": "error", "message": "Обновите токен+"})

        if 'error' in userinfo:
            return Response(status=401, content={"status": "error", "message": "Войдите заново"})

        kwargs['user_session_id'] = userinfo['sid']
        user_session_id = str(kwargs['user_session_id'])
        kwargs['access_token'] = access_token
        kwargs['userinfo'] = userinfo
        kwargs['username'] = userinfo['preferred_username']
        user_id = userinfo['sub']
        kwargs['user_id'] = user_id
        token_iat = userinfo['iat']

        try:
            user = User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            user = UserData.register(userinfo)

        if not user.is_active:
            return Response(status=401, content="Ваш аккаунт заблокирован, свяжитесь с администратором")

        kwargs['user'] = user
        kwargs['role'] = user.role

        # Проверка, что текущую сессию пользователя необходимо завершить
        session_logout = LogoutUser.objects.filter(user=user.id, session_id=user_session_id)
        if session_logout.exists():
            session_logout = session_logout.last()
            if session_logout.logout_type == LogoutUser.REFRESH_TOKEN:
                status_code = 468
                message = "Обновите токен"
            elif session_logout.logout_type == LogoutUser.LOGOUT:
                status_code = 401
                message = "Войдите заново"
            else:
                status_code = 468
                message = "Обновите токен"
            return Response(status=status_code, content={"status": "error", "message": message})

        token_iat_datetime = datetime.datetime.fromtimestamp(token_iat, tz=timezone.get_default_timezone())
        # Проверка, что все соединения пользователя необходимо завершить
        user_logout = LogoutUser.objects.filter(user=user.id,
                                                session_id=None,
                                                logout_type=LogoutUser.LOGOUT,
                                                iat_before__gt=token_iat_datetime)
        if user_logout.exists():
            return Response(status=401, content={"status": "error", "message": "Войдите заново"})

        # Проверка, что все соединения пользователя необходимо обновить (запросить токен заново)
        user_refresh_token = LogoutUser.objects.filter(user=user.id,
                                                       session_id=None,
                                                       logout_type=LogoutUser.REFRESH_TOKEN,
                                                       iat_before__gt=token_iat_datetime)
        if user_refresh_token.exists():
            return Response(status=468, content={"status": "error", "message": "Обновите токен"})

        return called_func(request, *args, **kwargs)

    return wrap


def check_http_method(allowed_methods):
    """
    Декоратор, проверяющий разрешенные HTTP методы
    """

    def decorator(called_func):
        def wrap(request, *args, **kwargs):
            if request.method == 'OPTIONS':
                if isinstance(allowed_methods, list):
                    allowed_methods.append('OPTIONS')
                    allow_header = " ".join(allowed_methods)
                else:
                    allow_header = f'OPTIONS {allowed_methods}'
                return Response(allowed_methods, headers={'Allow': allow_header})
            if request.method not in allowed_methods:
                return Response(content=f"Метод {request.method} запрещен", status=400)
            return called_func(request, *args, **kwargs)

        return wrap

    return decorator


def log_action(called_func):
    """
    Декоратор, записывающий действия пользователей.
    """

    def wrap(request, *args, **kwargs):
        try:
            user_id = kwargs['user_id']
            username = kwargs['username']
            user = f"[{user_id} | {username}]"
        except KeyError:
            user = None
        try:
            params = dict(request.GET)
        except:
            params = None
        try:
            body = json.loads(request.body.decode('utf-8'))
        except:
            body = None
        start_time = time.time()
        function = called_func(request, *args, **kwargs)
        end_time = time.time()
        taken_time = f"{(end_time - start_time) * 1000:.1f} мс."

        response_content = None
        status_code = None
        response_headers = None
        if isinstance(function, (HttpResponse, JsonResponse)):
            try:
                response_content = json.loads(function.content.decode('utf-8'))
            except:
                response_content = function.content
            status_code = function.status_code
            response_headers = function.headers

        action = {
            "taken_time": taken_time,
            "user": user,
            "method": request.method,
            "request_path": request.get_full_path(),
            "remote_address": request.META["REMOTE_ADDR"],
            "body": body,
            "params": params,
            "response": response_content,
            "status_code": status_code,
            "request_headers": request.headers,
            "response_headers": response_headers
        }
        try:
            Metric.objects.create(
                user_name=user,
                method=request.method,
                request_path=request.get_full_path(),
                status_code=status_code,
                remote_address=request.META["REMOTE_ADDR"],
                taken_time=(end_time - start_time) * 1000,
            )
        except Exception as e:
            print(traceback.format_exc())
            pass
        logger.info(action)
        return function

    return wrap


def tryexcept(called_func):
    """
    Декоратор, который оборачивает вызываемую функцию в try - except
    и в случае непредвиденной ошибки, шлет сообщение об этом в телеграм

    """

    def wrap(request, *args, **kwargs):
        if DEBUG:
            return called_func(request, *args, **kwargs)
        else:
            try:
                return called_func(request, *args, **kwargs)
            except Exception as error:
                authorization = request.headers.get("Authorization")
                message = f"""
                    Environment: {'PROD' if PRODUCTION else 'DEV'}
                    Authorization: {authorization}
                    URL: {request.get_full_path()}
                    Error: {error}
                    Traceback: {traceback.format_exc()}"""
                telegram_message(message)
                logger.warning(message)
                return Response(content="Произошла непредвиденная ошибка. Разработчики уже исправляют ее.", status=400)

    return wrap


def query_debugger(func):
    @functools.wraps(func)
    def inner_func(*args, **kwargs):
        reset_queries()

        start_queries = len(connection.queries)

        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()

        end_queries = len(connection.queries)

        print(f"Function : {func.__name__}")
        print(f"Number of Queries : {end_queries - start_queries}")
        print(f"Finished in : {(end - start):.2f}s")
        return result

    return inner_func
