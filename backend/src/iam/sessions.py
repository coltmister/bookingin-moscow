import logging

from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from core.utils.decorators import auth, log_action, tryexcept
from core.utils.exceptions import TokenObtainException, KeycloakResponseException
from core.utils.http import Response
from core.utils.notification import telegram_message
from iam.keycloak import Keycloak
from iam.models import LogoutUser
from users.models import User

logger = logging.getLogger(__name__)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class LogoutUserView(APIView):
    keycloak = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.keycloak = Keycloak()
        except TokenObtainException as error:
            return Response(status=400, content=error.message)
        return super().dispatch(request, *args, **kwargs)

    def delete(self, request, user_uuid=None, *args, **kwargs):
        """Выход со всех устройств, кроме текущего, если не передан user_uuid.
        Выход со всех устройств, если передан user_uuid."""
        if not user_uuid:
            user = kwargs['user']
            current_user_session = kwargs['user_session_id']

            try:
                sessions = self.keycloak.get_user_sessions(user_id=user.id)
            except KeycloakResponseException as error:
                message = f"Не удалось получить сессии пользователя {user.id}. Ошибка {error}"
                telegram_message(message)
                logger.warning(message)
                return Response(status=400,
                                content=f"Не удалось получить сессии пользователя {user.id}, попробуйте повторить позднее")

            # Удаляю текущую сессию пользователя из списка всех его сессий
            session_ids = [session['id'] for session in sessions]
            if current_user_session in session_ids:
                del session_ids[session_ids.index(current_user_session)]

            # Удаляю все сессии пользователя, кроме текущей
            for session_id in session_ids:
                try:
                    self.keycloak.delete_user_session(session_id=session_id)
                except KeycloakResponseException as error:
                    message = f"Не удалось удалить сессию {session_id} пользователя {user.id}. Ошибка {error}"
                    telegram_message(message)
                    logger.warning(message)
                    return Response(status=400,
                                    content=f"Не удалось удалить одну из сессий, попробуйте повторить позднее")

                LogoutUser.objects.create(user=user,
                                          session_id=session_id,
                                          iat_before=timezone.now().replace(microsecond=0),
                                          logout_type=LogoutUser.LOGOUT)

            return Response(status=200, content="Все ваши сессии, кроме текущей удалены")

        try:
            user = User.objects.get(id=user_uuid)
        except ObjectDoesNotExist:
            return Response(status=400, content="Пользователь не найден")

        try:
            self.keycloak.logout_user(user_id=user.id)
        except KeycloakResponseException as error:
            message = f"Не удалось удалить все сессии пользователя {user.id}. Ошибка {error}"
            telegram_message(message)
            logger.warning(message)
            return Response(status=400, content="Не удалось сбросить все сессии, попробуйте повторить позднее")

        LogoutUser.objects.create(user=user,
                                  session_id=None,
                                  iat_before=timezone.now().replace(microsecond=0),
                                  logout_type=LogoutUser.LOGOUT)

        return Response(content="Все сессии пользователя успешно сброшены")