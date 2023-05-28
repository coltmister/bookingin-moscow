import logging

import requests
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from core.utils.decorators import check_http_method, tryexcept, log_action
from core.utils.http import Response
from settings.settings import CLIENT_ID, CLIENT_SECRET, AUTHORIZATION_ENDPOINT, \
    END_SESSION_ENDPOINT, REDIRECT_URI, HOST

logger = logging.getLogger(__name__)


@check_http_method(['GET'])
@tryexcept
@log_action
def login(request, **kwargs):
    context = {"host": HOST, "redirect_uri": REDIRECT_URI}
    return render(request, '../templates/obtain_tokens.html', context)


@check_http_method(['GET'])
@tryexcept
@log_action
def login_page(request, **kwargs):
    context = {"host": HOST, "redirect_uri": REDIRECT_URI}
    return render(request, '../templates/login.html', context)


@method_decorator([tryexcept, log_action], name='dispatch')
class ObtainTokensView(APIView):
    def get(self, request, *args, **kwargs):
        code = request.GET.get('code')
        if not code:
            return Response(status=400, content="Отсутствует code")
        redirect_uri = request.GET.get('redirect_uri')
        if not redirect_uri:
            redirect_uri = REDIRECT_URI

        payload = f'redirect_uri={redirect_uri}&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=authorization_code&code={code}'
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        response = requests.request("POST", AUTHORIZATION_ENDPOINT, headers=headers, data=payload)
        if response.status_code != 200:
            return Response(status=400, content=response.json())
        response = response.json()
        content = {
            'access_token': response['access_token'],
            'refresh_token': response['refresh_token']
        }
        return Response(content=content)


@method_decorator([tryexcept, log_action], name='dispatch')
class RefreshTokenView(APIView):
    def post(self, request, *args, **kwargs):
        """Метод обновляет access_token и refresh_token."""

        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response(content="Ключ refresh_token отсутствует в body", status=400)

        payload = f'client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=refresh_token&refresh_token={refresh_token}'
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}
        response = requests.request("POST", AUTHORIZATION_ENDPOINT, headers=headers, data=payload)

        if "refresh_token" not in response.json():
            logger.info(f"Ошибка при обновлении токена: {response.json()}")
            return Response(status=401, content="Войдите заново")

        return Response(response.json())


@check_http_method(['GET'])
@tryexcept
@log_action
def logout(request, *args, **kwargs):
    post_logout_redirect_uri = request.GET.get('post_logout_redirect_uri')
    if post_logout_redirect_uri:
        return HttpResponseRedirect(
            f"{END_SESSION_ENDPOINT}?post_logout_redirect_uri={post_logout_redirect_uri}")
    else:
        return HttpResponseRedirect(END_SESSION_ENDPOINT)
