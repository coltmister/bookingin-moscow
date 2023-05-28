import json
import logging
import traceback
from typing import Optional
from uuid import UUID

import requests
from django.utils import timezone
from requests import JSONDecodeError

from core.utils.exceptions import TokenObtainException, KeycloakResponseException
from core.utils.http import parse_response
from core.utils.notification import telegram_message
from settings.settings import CLIENT_SECRET, CLIENT_ID, AUTHORIZATION_ENDPOINT, ADMIN_URL, USERS_ENDPOINT, \
    ACCOUNT_SESSION_URL, ADMIN_SESSION_URL, USER_INFO_ENDPOINT

logger = logging.getLogger(__name__)


class Keycloak:
    """Класс для взаимодействия с Keycloak"""

    def __init__(self):
        self.client_id = CLIENT_ID
        self.client_secret = CLIENT_SECRET
        self.access_token = self.obtain_service_account_access_token()

    @staticmethod
    def get_user_info(access_token):
        headers = {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': f"Bearer {access_token}"}
        response = requests.request("POST", USER_INFO_ENDPOINT, headers=headers)
        return parse_response(response)

    def obtain_service_account_access_token(self) -> Optional[str]:
        """
        Метод получает токен сервисного аккаунта
        :return: access_token или None, если произошла ошибка
        """
        payload = f'client_secret={self.client_secret}&client_id={self.client_id}&grant_type=client_credentials'
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}

        response = requests.request("POST", AUTHORIZATION_ENDPOINT, headers=headers, data=payload)
        try:
            access_token = response.json()['access_token']
        except (JSONDecodeError, KeyError):
            message = f'Не удалось получить сервисный access_token. Traceback: {traceback.format_exc()}'
            logger.warning(message)
            telegram_message(message)
            raise TokenObtainException("Не удалось получить сервисный токен авторизации")
        else:
            return access_token


    def get_user_sessions(self, user_id: UUID | str):
        """Метод возвращает сессии пользователя"""
        headers = {'Authorization': f'Bearer {self.access_token}'}
        response = requests.request("GET", f"{USERS_ENDPOINT}/{user_id}/sessions", headers=headers)
        return parse_response(response)


    def change_user_status(self, user_id: UUID | str, attributes: dict):
        """Метод блокирует/разблокирует пользователя"""
        payload = json.dumps(attributes)
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {self.access_token}'}
        response = requests.request("PUT", f"{USERS_ENDPOINT}/{user_id}", headers=headers, data=payload)
        return parse_response(response)


    def delete_user_session(self, session_id: UUID | str):
        """Метод удаляет заданную сессию session_id"""
        headers = {'Authorization': f'Bearer {self.access_token}', 'Content-Type': 'application/json', }
        response = requests.request(
            "DELETE",
            f"{ADMIN_SESSION_URL}/{session_id}",
            headers=headers)
        return parse_response(response)


    def logout_user(self, user_id: UUID | str):
        """Метод удаляет все сессии пользователя"""
        headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {self.access_token}'}
        response = requests.request("POST", f"{ADMIN_URL}/users/{user_id}/logout", headers=headers)
        return parse_response(response)
