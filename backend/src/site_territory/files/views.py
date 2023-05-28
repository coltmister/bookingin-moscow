import logging
import uuid

from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.views import APIView

from core.utils.decorators import auth, log_action, tryexcept
from core.utils.exceptions import BadRequestException, S3ConnectionError, S3DownloadError, S3UploadError
from core.utils.files import S3Wrapper, UploadFileSerializer
from core.utils.http import Response
from core.utils.paginators import AbstractPaginator
from site_territory.files.serializers import SiteFileSerializer, SitePhotoSerializer, TerritoryFileSerializer, \
    TerritoryPhotoSerializer
from site_territory.models import Site, SiteFile, SitePhoto, Territory, TerritoryFile, TerritoryPhoto
from users.models import User

logger = logging.getLogger(__name__)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AbstractFileView(APIView):
    s3 = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    bucket = None
    model = None
    create_model = None
    key = None
    instance = None
    instance_name = None
    serializer_class = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.s3 = S3Wrapper(bucket_name=self.bucket)
        except S3ConnectionError as error:
            logger.warning(error)
            return Response(status=400, content="Ошибка при соединении с сервером S3. Повторите попытку позже")
        user = kwargs.get('user')
        slug = kwargs.get('slug')
        if slug:
            try:
                self.instance = self.model.objects.get(subdomain=slug)
            except self.model.DoesNotExist:
                return Response(status=404, content="Объект не найден")
        else:
            try:
                self.instance = self.model.objects.get(id=kwargs.get('uuid'))
            except self.model.DoesNotExist:
                return Response(status=404, content="Объект не найден")
        if request.method in ['POST', 'DELETE'] and user.role != User.RoleType.ADMIN:
            if self.model == Site and self.instance.creator != user:
                return Response(status=403, content="У вас нет прав на создание этого файла")
            if self.model == Territory and self.instance.site.creator != user:
                return Response(status=403, content="У вас нет прав на создание этого файла")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        documents = getattr(self.instance, self.key).all()
        try:
            paginator = AbstractPaginator(self.model, self.serializer_class, documents, context={"kwargs": self.kwargs},
                                          request=request)
            result = paginator.get_result(search_list=['id__icontains'],
                                          filter_kwargs={"user": self.kwargs.get('user')})
        except BadRequestException as error:
            return Response(status=400, content=error.message)
        return Response(content=result)

    def post(self, request, *args, **kwargs):
        data = UploadFileSerializer(data=request.FILES)
        data.is_valid(raise_exception=True)
        file = data.save()
        file_uuid = uuid.uuid4()
        full_object = {
            "file_name": f"{file_uuid}_{file.file_name}",
            self.instance_name: self.instance
        }
        instance = self.create_model.objects.create(**full_object)
        try:
            self.s3.upload_file(f"{file_uuid}_{file.file_name}", file.file)
        except (S3UploadError, S3DownloadError) as error:
            logger.warning(error)
            return Response(status=400, content="Не удалось загрузить файл документа. Повторите попытку позже")
        return Response(status=201, content={"id": str(instance.id), 'url': instance.get_url()})

    def delete(self, request, *args, **kwargs):
        print(kwargs.get('file_id'))
        try:
            instance = self.create_model.objects.get(id=kwargs.get('file_id'))
        except self.create_model.DoesNotExist:
            return Response(status=404, content="Файл не найден")
        instance.delete()
        return Response(status=204)



class SitePhotoView(AbstractFileView):
    bucket = 'booking-sites'
    model = Site
    create_model = SitePhoto
    key = 'photos'
    instance_name = 'site'
    serializer_class = SitePhotoSerializer


class SiteFileView(AbstractFileView):
    bucket = 'booking-sites'
    model = Site
    create_model = SiteFile
    key = 'files'
    instance_name = 'site'
    serializer_class = SiteFileSerializer


class TerritoryFileView(AbstractFileView):
    bucket = 'booking-sites'
    model = Territory
    create_model = TerritoryFile
    key = 'files'
    instance_name = 'territory'
    serializer_class = TerritoryFileSerializer


class TerritoryPhotoView(AbstractFileView):
    bucket = 'booking-sites'
    model = Territory
    create_model = TerritoryPhoto
    key = 'photos'
    instance_name = 'territory'
    serializer_class = TerritoryPhotoSerializer
