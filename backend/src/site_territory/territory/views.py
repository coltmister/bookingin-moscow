from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.models import Booking
from core.utils.decorators import auth, auth_anon, log_action, tryexcept
from core.utils.exceptions import BadRequestException
from core.utils.http import Response
from core.utils.paginators import AbstractPaginator
from site_territory.models import Category, Site, Territory
from site_territory.serializers import CategorySerializer
from site_territory.territory.serializers import TerritoryReadSerializer, TerritorySettingsSerializer, \
    WriteTerritorySerializer
from users.models import User


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class CategoryView(APIView):
    user = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if self.user and self.user.role != User.RoleType.ADMIN and request.method == 'POST':
            return Response(status=403, content="У вас нет прав на редактирование категорий")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        categories = Category.objects.all()
        result = CategorySerializer(categories, many=True).data
        return Response(result)

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = CategorySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        return Response(status=201, content={'id': str(instance.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class CategoryViewDetail(APIView):
    user = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if self.user.role != User.RoleType.ADMIN and request.method != 'GET':
            return Response(status=403, content="У вас нет прав на редактирование категорий")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        category_id = kwargs.get('category_id')
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        result = CategorySerializer(category).data
        return Response(result)

    def put(self, request, *args, **kwargs):
        category_id = kwargs.get('category_id')
        data = request.data
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        serializer = CategorySerializer(category, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        category_id = kwargs.get('category_id')
        try:
            category = Category.objects.get(id=category_id)
            if category.territories.exists():
                return Response(status=403, content="Нельзя удалить категорию, в которой есть территории")
        except Category.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        category.delete()
        return Response(status=204)


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class TerritoriesView(APIView):
    user = None
    site_id = None
    site = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        self.site_id = kwargs.get('site_id')
        try:
            self.site = Site.objects.get(id=self.site_id)
        except Site.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        territories = self.site.territories.all()
        try:
            paginator = AbstractPaginator(Territory, TerritoryReadSerializer, territories,
                                          context={"kwargs": kwargs},
                                          request=request)
            result = paginator.get_result(search_list=['name__icontains', 'brief_description__icontains',
                                                       'description__icontains'])
        except BadRequestException as error:
            return Response(status=400, content=error.message)
        return Response(result)

    def post(self, request, *args, **kwargs):
        if self.user.role != User.RoleType.ADMIN and self.site.creator != self.user:
            return Response(status=403, content="У вас нет прав на редактирование территорий")
        data = request.data
        serializer = WriteTerritorySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(site=self.site)
        return Response(status=201, content={'id': str(instance.id)})


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class TerritoryViewDetail(APIView):
    user = None
    site_id = None
    site = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        try:
            territory = Territory.objects.get(id=territory_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        result = TerritoryReadSerializer(territory, context={"kwargs": kwargs}).data
        return Response(result)

    def put(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        data = request.data
        try:
            territory = Territory.objects.get(id=territory_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        if self.user.role != User.RoleType.ADMIN and territory.site.creator != self.user:
            return Response(status=403, content="У вас нет прав на редактирование территорий")
        serializer = WriteTerritorySerializer(territory, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        try:
            territory = Territory.objects.get(id=territory_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        if self.user.role != User.RoleType.ADMIN and territory.site.creator != self.user:
            return Response(status=403, content="У вас нет прав на редактирование территорий")
        if territory.bookings.filter(status=Booking.BookingStatus.AGREED).exists():
            return Response(status=403, content="Нельзя удалить территорию, в которой есть бронирования")
        territory.delete()
        return Response(status=204)


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class TerritorySettingsView(APIView):
    user = None
    territory = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        territory_id = kwargs.get('territory_id')
        try:
            self.territory = Territory.objects.get(id=territory_id)
        except Territory.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):

        included_fields = ['id', 'duration', 'max_slots', 'is_working_hours_set' 'territory']
        if self.user.role == User.RoleType.ADMIN or self.territory.site.creator == self.user:
            included_fields.extend(['external_name', 'calendar_url', 'booking_calendar_url'])

        result = TerritorySettingsSerializer(self.territory.settings, included_fields=included_fields).data
        return Response(result)

    def put(self, request, *args, **kwargs):
        if self.user.role != User.RoleType.ADMIN and self.territory.site.creator != self.user:
            return Response(status=403, content="У вас нет прав на редактирование территорий")
        data = request.data
        serializer = TerritorySettingsSerializer(self.territory.settings, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)
