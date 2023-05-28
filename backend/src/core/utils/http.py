import datetime
import json
import logging
from typing import OrderedDict

from django.http import HttpResponse
from django.utils import timezone
from rest_framework.utils.serializer_helpers import ReturnDict, OrderedDict, ReturnList

from core.utils.exceptions import KeycloakResponseException, BadRequestException

logger = logging.getLogger(__name__)


def is_json(content):
    try:
        json.loads(content)
    except Exception:
        return False
    return True


def Response(content=None, status: int = 200, headers: dict = None, cookies: dict = None):
    """
    Функция сериализует получаемый content, добавляет заголовок CORS,
    а также, принимает заданные header.
    """
    if content is None:
        response = HttpResponse(status=status)
    elif is_json(content):
        response = HttpResponse(content, content_type='application/json', status=status)
    elif isinstance(content, str):
        content = {"message": content}
        json_data = json.dumps(content, ensure_ascii=False)
        response = HttpResponse(json_data, content_type='application/json', status=status)
    elif type(content) in [dict, list, ReturnDict, OrderedDict, ReturnList]:
        json_data = json.dumps(content, ensure_ascii=False)
        response = HttpResponse(json_data, content_type='application/json', status=status)
    else:
        response = HttpResponse(content, content_type='text/plain', status=status)

    response['Access-Control-Allow-Origin'] = '*'
    if headers:
        for header in headers:
            response[header] = headers[header]

    if cookies:
        for key, cookie_settings in cookies.items():
            if isinstance(cookie_settings, str):
                response.set_cookie(key=key, value=cookie_settings)
            elif isinstance(cookie_settings, dict):
                value = cookie_settings.get('value')
                secure = cookie_settings.get('secure', True)
                httponly = cookie_settings.get('httponly', False)
                same_site = cookie_settings.get('same_site', 'None')
                expires = cookie_settings.get('expires_min', None)
                if expires:
                    try:
                        expires = timezone.now() + datetime.timedelta(expires)
                    except Exception:
                        expires = None
                path = cookie_settings.get('path', '/')
                response.set_cookie(key=key, value=value, secure=secure, httponly=httponly, samesite=same_site,
                                    expires=expires, path=path)
            else:
                continue

    return response


def parse_response(response):
    """
    Функция парсит переданный ей response и возвращает True и объект, если код ответа 200/201/204,
    и False и сообщение об ошибке, если код ответа 400, 401, 403, 404, 405, 409, 415, 500
    или другой, отличный от 200/201/204
    :param response:
    :return:
    """

    try:
        json_response = response.json()
    except:
        json_response = None

    if response.status_code == 200:
        # Indicates the request completed successfully regardless the size of the response body
        return json_response
    elif response.status_code == 201:
        # Indicates the request completed successfully and a resource was created
        location = response.headers['Location']
        object_id = location.split('/')[-1]
        return object_id
    elif response.status_code == 204:
        # Indicates the request completed successfully and the server did not provide a response body
        return json_response
    elif response.status_code == 400:
        # Indicates that the request is invalid, usually related with the validation of the payload
        if not json_response:
            raise KeycloakResponseException('Не удалось декодировать ответ от сервера авторизации')
        if 'errorMessage' in json_response:
            raise KeycloakResponseException(json_response['errorMessage'])
        else:
            raise KeycloakResponseException(response.text)

    elif response.status_code == 401:
        # Indicates that clients should provide authorization or the provided authorization is invalid
        raise KeycloakResponseException('Время жизни токена истекло')
    elif response.status_code == 403:
        # Indicates that the authorization provided by the client is not enough to access the resource
        raise KeycloakResponseException('Недостаточно прав для совершения данной операции')
    elif response.status_code == 404:
        # Indicates that the requested resource does not exist
        raise KeycloakResponseException('Запрашиваемый объект не найден')
    elif response.status_code == 405:
        # Indicates that the method chosen by the client to access a resource is not supported
        raise KeycloakResponseException('Запрашиваемый метод недоступен')
    elif response.status_code == 409:
        # Indicates that the resource the client is trying to create already exists or some conflict when
        # processing the request
        if not json_response:
            raise KeycloakResponseException('Неизвестная ошибка валидации')
        if 'errorMessage' in json_response:
            raise KeycloakResponseException(json_response['errorMessage'])
        else:
            raise KeycloakResponseException(response.text)
    elif response.status_code == 415:
        # Indicates that the requested media type is not supported
        raise KeycloakResponseException('Запрашиваемый тип не поддерживается')
    elif response.status_code == 500:
        # Indicates that the server could not fulfill the request due to some unexpected error
        raise KeycloakResponseException('Произошла внутренняя ошибка сервера авторизации')
    else:
        raise KeycloakResponseException('Произошла внутренняя ошибка')


def clean_get_params(request):
    """
    Функция очищает параметры в GET запросе и проверяет, чтобы они были валидные
    """
    search = request.GET.get('search')
    page = request.GET.get('page')
    items_per_page = request.GET.get('itemsPerPage')
    sort_by = request.GET.getlist('sortBy')
    sort_desc = request.GET.getlist('sortDesc')
    if sort_by and sort_desc:
        if len(sort_by) != len(sort_desc):
            raise BadRequestException("Некорректные параметры в запросе")
        for index, value in enumerate(sort_desc):
            if value not in ['true', 'false']:
                raise BadRequestException("Некорректные параметры в запросе")
            else:
                sort_desc[index] = '-' if value == 'true' else ''
                # True - desc, False - asc
    else:
        sort_by = None
        sort_desc = None
    if not search:
        search = None
    else:
        search = search.lower().strip()

    if page:
        if not page.isdigit():
            page = 1
    else:
        page = 1
    if items_per_page:
        if not items_per_page.isdigit():
            items_per_page = 20
    else:
        items_per_page = 20

    return search, page, items_per_page, sort_by, sort_desc
