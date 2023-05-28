import io
import logging
import uuid

from PIL import Image
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.views import APIView

from core.utils.decorators import tryexcept, auth, log_action
from core.utils.exceptions import BadRequestException, S3ConnectionError, S3UploadError, S3DownloadError, S3DeleteError, \
    TokenObtainException, KeycloakResponseException
from core.utils.files import UploadFileSerializer, S3Wrapper
from core.utils.http import Response
from core.utils.paginators import AbstractPaginator
from iam.keycloak import Keycloak
from settings.settings import S3_USER_PHOTO_BUCKET
from users.filters import UserFilter
from users.models import User, Company
from users.serializers import UserSerializer, CompanySerializer

logger = logging.getLogger(__name__)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserView(APIView):
    def get(self, request, *args, **kwargs):
        """Получение всех пользователей"""
        user = kwargs.get('user')
        users = User.objects.all()
        excluded_fields = []

        if user.is_tenant:
            excluded_fields = ['email', 'phone', 'date_of_birth']

        try:
            paginator = AbstractPaginator(User, UserSerializer, users,
                                          filter_instance=UserFilter,
                                          excluded_fields=excluded_fields,
                                          context={"kwargs": kwargs}, request=request)
            result = paginator.get_result(
                search_list=['surname', 'name', 'patronymic'],
                filter_kwargs={"user": user},
            )
        except BadRequestException as error:
            return Response(status=400, content=error.message)

        return Response(result)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserDetailView(APIView):
    def get(self, request, user_pk, *args, **kwargs):
        user = kwargs.get('user')
        try:
            searched_user = User.objects.get(pk=user_pk)
        except ObjectDoesNotExist:
            return Response(status=404, content="Пользователь не найден")
        excluded_fields = []
        if user.is_tenant:
            excluded_fields = ['email', 'phone', 'date_of_birth']
        serializer = UserSerializer(searched_user, excluded_fields=excluded_fields)
        return Response(serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyUserView(APIView):
    def get(self, *args, **kwargs):
        return Response(UserSerializer(kwargs.get('user')).data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserAvatarView(APIView):
    s3 = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def dispatch(self, request, *args, **kwargs):
        try:
            self.s3 = S3Wrapper(bucket_name=S3_USER_PHOTO_BUCKET)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(status=400, content="Ошибка при соединении с сервером S3. Повторите попытку позже")

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Загрузка аватара пользователя"""
        user = kwargs.get('user')
        data = UploadFileSerializer(data=request.FILES)
        data.is_valid(raise_exception=True)
        file = data.save()
        file = file.file
        avatar_uuid = str(uuid.uuid4())
        avatar_path = f"{avatar_uuid}.jpg"
        thumbnail_uuid = str(uuid.uuid4())
        thumbnail_path = f"{thumbnail_uuid}.jpg"

        # Привожу фото к JPEG формату, чтобы не волноваться про остальные виды
        try:
            if isinstance(file, io.BytesIO):
                photo = Image.open(file)
            else:
                photo = Image.open(io.BytesIO(file))
        except Exception as error:
            logger.warning(error)
            return Response(status=400, content="Ошибка в файле фотографии")
        if photo.mode in ("RGBA", "P"):
            photo = photo.convert('RGB')
        photo_data = io.BytesIO()
        photo.save(photo_data, 'JPEG', quality=100)
        # Создаю миниатюру для фото человека
        thumbnail = Image.open(photo_data)
        max_size = (300, 400)
        thumbnail.thumbnail(max_size)
        if thumbnail.mode in ("RGBA", "P"):
            thumbnail = thumbnail.convert('RGB')
        thumbnail_data = io.BytesIO()
        thumbnail.save(thumbnail_data, 'JPEG', quality=100)
        # Нужно перекинуть байты в начало, иначе ничего не сохранится
        thumbnail_data.seek(0)
        photo_data.seek(0)

        try:
            self.s3.upload_file(avatar_path, photo_data)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=400, content="Не удалось загрузить фотографию. Повторите попытку позже")

        try:
            self.s3.upload_file(thumbnail_path, thumbnail_data)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=400, content="Не удалось загрузить фотографию. Повторите попытку позже")

        user.avatar = avatar_uuid
        user.avatar_thumbnail = thumbnail_uuid
        user.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        user = kwargs.get('user')

        try:
            self.s3.delete_file(str(user.avatar))
        except S3DeleteError as error:
            logger.warning(error)
        try:
            self.s3.delete_file(str(user.avatar_thumbnail))
        except S3DeleteError as error:
            logger.warning(error)

        # Обновляю информацию в пользователе
        user.avatar = None
        user.avatar_thumbnail = None
        user.save()

        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class PromoteToAdminView(APIView):
    def post(self, request, user_pk, *args, **kwargs):
        user = kwargs.get('user')
        if not user.is_admin:
            return Response(status=403, content="Недостаточно прав для выполнения операции")

        try:
            searched_user = User.objects.get(pk=user_pk)
        except ObjectDoesNotExist:
            return Response(status=404, content="Пользователь не найден")
        current_user_role = searched_user.role
        if current_user_role == User.RoleType.ADMIN:
            try:
                company = searched_user.company
                searched_user.role = User.RoleType.LANDLORD
            except Company.DoesNotExist:
                searched_user.role = User.RoleType.TENANT

        else:
            searched_user.role = User.RoleType.ADMIN
        searched_user.save()
        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class VerifyUserView(APIView):
    def post(self, request, user_pk, *args, **kwargs):
        user = kwargs.get('user')
        if not user.is_admin:
            return Response(status=403, content="Недостаточно прав для выполнения операции")

        try:
            searched_user = User.objects.get(pk=user_pk)
        except ObjectDoesNotExist:
            return Response(status=404, content="Пользователь не найден")
        if searched_user.is_verified:
            searched_user.is_verified = False
        else:
            searched_user.is_verified = True
        searched_user.save()
        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class UserActivityStatusView(APIView):
    keycloak = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.keycloak = Keycloak()
        except TokenObtainException as error:
            return Response(status=400, content=error.message)
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, user_pk, *args, **kwargs):
        """Заблокировать/разблокировать пользователя."""

        current_user = self.kwargs.get('user')
        if not current_user.is_admin:
            return Response(content="Вы не являетесь администратором", status=400)

        if current_user.id == user_pk:
            return Response(content="Нельзя изменить свой статус активности", status=400)

        try:
            target_user = User.objects.get(id=user_pk)
        except ObjectDoesNotExist:
            return Response(status=400, content=f"Пользователь не найден")

        if target_user.is_active:
            enabled = False
        else:
            enabled = True

        attributes = {"enabled": enabled}

        try:
            self.keycloak.change_user_status(user_id=target_user.id, attributes=attributes)
        except KeycloakResponseException as error:
            message = f"Не удалось заблокировать пользователя {target_user.id}. Ошибка {error}"
            logger.warning(message)
            return Response(status=400,
                            content="Не удалось изменить статус активности пользователя, попробуйте повторить позднее")

        # Изменяю статус активности пользователя
        target_user.is_active = enabled
        target_user.save()

        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class CompanyDetailView(APIView):
    def get(self, request, user_pk, *args, **kwargs):
        user = kwargs.get('user')

        try:
            searched_user = User.objects.get(pk=user_pk)
        except ObjectDoesNotExist:
            return Response(status=404, content="Пользователь не найден")

        try:
            company = searched_user.company
        except ObjectDoesNotExist:
            return Response(status=404, content="Компания не найдена")

        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def put(self, request, user_pk, *args, **kwargs):
        user = kwargs.get('user')

        try:
            searched_user = User.objects.get(pk=user_pk)
        except ObjectDoesNotExist:
            return Response(status=404, content="Пользователь не найден")
        if not user.is_admin or user.id != searched_user.id:
            return Response(status=403, content="Недостаточно прав для выполнения операции")

        try:
            company = searched_user.company
        except ObjectDoesNotExist:
            return Response(status=404, content="Компания не найдена")

        serializer = CompanySerializer(company, data=request.data)
        serializer.is_valid()
        serializer.save()
        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class CompanyLogoView(APIView):
    s3 = None
    company = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def dispatch(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.is_tenant:
            return Response(status=403, content="Недостаточно прав для выполнения операции")

        try:
            self.company = user.company
        except ObjectDoesNotExist:
            return Response(status=404, content="Компания не найдена")

        try:
            self.s3 = S3Wrapper(bucket_name=S3_USER_PHOTO_BUCKET)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(status=400, content="Ошибка при соединении с сервером S3. Повторите попытку позже")

        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Загрузка логотипа компании"""
        data = UploadFileSerializer(data=request.FILES)
        data.is_valid(raise_exception=True)
        file = data.save()
        file = file.file
        logo_uuid = str(uuid.uuid4())
        logo_path = f"{logo_uuid}.jpg"

        # Привожу фото к JPEG формату, чтобы не волноваться про остальные виды
        try:
            if isinstance(file, io.BytesIO):
                logo = Image.open(file)
            else:
                logo = Image.open(io.BytesIO(file))
        except Exception as error:
            logger.warning(error)
            return Response(status=400, content="Ошибка в файле фотографии")
        if logo.mode in ("RGBA", "P"):
            logo = logo.convert('RGB')
        logo_data = io.BytesIO()
        logo.save(logo_data, 'JPEG', quality=100)
        logo_data.seek(0)

        try:
            self.s3.upload_file(logo_path, logo_data)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=400, content="Не удалось загрузить фотографию. Повторите попытку позже")

        self.company.logo = logo_uuid
        self.company.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        try:
            self.s3.delete_file(str(self.company.logo))
        except S3DeleteError as error:
            logger.warning(error)

        # Обновляю информацию в пользователе
        self.company.logo = None
        self.company.save()

        return Response(status=204)
