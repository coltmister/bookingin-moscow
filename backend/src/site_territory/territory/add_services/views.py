from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.models import ChosenAddServices
from core.utils.decorators import auth_anon, log_action, tryexcept
from core.utils.http import Response
from site_territory.models import Territory
from site_territory.territory.add_services.serializers import AddServiceSerializer
from site_territory.territory.serializers import ServiceReadSerializer
from users.models import User


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class AddServiceView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        try:
            self.territory = Territory.objects.get(id=territory_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if kwargs.get('is_anonymous') or (user.role != User.RoleType.ADMIN and self.territory.site.creator != user):
            data = self.territory.add_services.filter(is_active=True)
        else:
            data = self.territory.add_services.all()
        result = ServiceReadSerializer(data, many=True).data
        return Response(result)

    def post(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if kwargs.get('is_anonymous') or (user.role != User.RoleType.ADMIN and self.territory.site.creator != user):
            return Response(status=403, content="У вас нет прав на редактирование услуг")
        data = request.data
        data['territory'] = self.territory.id
        serializer = AddServiceSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(territory=self.territory)
        return Response(status=201, content={'id': str(instance.id)})


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class AddServiceViewDetail(APIView):
    territory = None
    service = None

    def dispatch(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        try:
            self.territory = Territory.objects.get(id=territory_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        service_id = kwargs.get('service_id')
        try:
            user = kwargs.get('user')
            if kwargs.get('is_anonymous') or (user.role != User.RoleType.ADMIN and self.territory.site.creator != user):
                self.service = self.territory.add_services.get(id=service_id, is_active=True)
            else:
                self.service = self.territory.add_services.get(id=service_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        result = ServiceReadSerializer(instance=self.service).data
        return Response(result)

    def put(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if kwargs.get('is_anonymous') or (user.role != User.RoleType.ADMIN and self.territory.site.creator != user):
            return Response(status=403, content="У вас нет прав на редактирование услуг")
        data = request.data
        serializer = AddServiceSerializer(instance=self.service, data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if kwargs.get('is_anonymous') or (user.role != User.RoleType.ADMIN and self.territory.site.creator != user):
            return Response(status=403, content="У вас нет прав на редактирование услуг")
        if ChosenAddServices.objects.filter(add_service=self.service).exists():
            return Response(status=403, content="Услуга использовалась в бронированиях. Удаление невозможно")
        self.service.delete()
        return Response(status=204)
