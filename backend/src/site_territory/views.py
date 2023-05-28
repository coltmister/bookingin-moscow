import traceback

import django_filters
from django.contrib.gis.geos import Polygon
from django.core.validators import URLValidator
from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.models import Booking
from core.utils.decorators import auth, auth_anon, log_action, tryexcept
from core.utils.exceptions import BadRequestException
from core.utils.http import Response
from core.utils.notification import telegram_message
from core.utils.paginators import AbstractPaginator
from site_territory.models import DomainAPIException, Site
from site_territory.serializers import SiteSerializer, WriteSiteSerializer
from site_territory.utils import get_underground_stations, suggest_address, suggest_sites
from users.models import User


class SiteFilter(django_filters.FilterSet):
    bbox = django_filters.CharFilter(method='bbox_filter')
    creator = django_filters.CharFilter(method='creator_filter')
    available_date = django_filters.DateFilter(method='get_available_date')

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    def bbox_filter(self, queryset, name, value):
        if value:
            bbox = value.split(',')

            if len(bbox) != 4:
                return queryset.none()
            else:
                bbox = (
                    bbox[1], bbox[0], bbox[3], bbox[2])
                geom = Polygon.from_bbox(bbox)
                return queryset.filter(coords__within=geom)
        else:
            return queryset.none()

    def creator_filter(self, queryset, name, value):
        if value:
            result = queryset.filter(creator__id=value)
            return result

        else:
            return queryset.none()

    def get_available_date(self, queryset, name, value):
        result_ids = []
        for site in queryset:
            territories = site.territories.all()
            for territory in territories:
                if territory.check_availability(value):
                    result_ids.append(site.id)
                    break
        if not result_ids:
            return queryset.none()
        return queryset.filter(id__in=result_ids)

    class Meta:
        model = Site
        fields = {
            'territories__category': ['exact'],
            'rating': ['gte', 'lte'],
            'territories__price': ['gte', 'lte'],
            'underground': ['exact'],
            'is_confirmed': [],
            'is_active': [],
            'is_blocked': [],
            'creator': [],
        }


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class SiteView(APIView):
    sites = None
    excluded_fields = None

    def dispatch(self, request, *args, **kwargs):
        self.excluded_fields = ['landing']
        if kwargs.get('is_anonymous'):
            filter_q = Q(is_active=True, is_blocked=False, is_confirmed=True)
            self.sites = Site.objects.filter(filter_q).distinct()
            self.excluded_fields.extend(['is_active', 'is_blocked', 'is_confirmed', 'created_at', 'updated_at'])
            return super().dispatch(request, *args, **kwargs)
        user = kwargs.get('user')

        if user.role == User.RoleType.ADMIN:
            self.sites = Site.objects.all()
        else:
            filter_q = Q(is_active=True, is_blocked=False, is_confirmed=True) | Q(creator=user)
            self.sites = Site.objects.filter(filter_q)
            self.excluded_fields.extend(['is_active', 'is_blocked', 'is_confirmed', 'created_at', 'updated_at'])
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        bbox = request.GET.get('bbox')
        if bbox:
            result = SiteFilter(data=request.GET, queryset=self.sites)
            if result.is_valid():
                result = result.qs
            else:
                return Response(status=400, content=result.errors)
            result = SiteSerializer(result, many=True, context={"kwargs": kwargs}).data
        else:
            try:
                paginator = AbstractPaginator(Site, SiteSerializer, self.sites, context={"kwargs": kwargs},
                                              filter_instance=SiteFilter, request=request,
                                              excluded_fields=self.excluded_fields)
                result = paginator.get_result(search_list=['name__icontains', 'brief_description__icontains',
                                                           'email__icontains', 'address__icontains'],
                                              filter_kwargs={"user": kwargs.get('user')})
            except BadRequestException as error:
                return Response(status=400, content=error.message)
        return Response(result)

    def post(self, request, *args, **kwargs):
        if kwargs.get('is_anonymous'):
            return Response(status=403, content="Нет доступа")
        user = kwargs.get('user')
        if user.role == User.RoleType.TENANT:
            return Response(status=403, content="Нет доступа")
        data = request.data
        serializer = WriteSiteSerializer(data=data, context={"kwargs": kwargs})
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(creator=user)
        return Response(status=201, content={'id': str(instance.id)})


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class SiteViewDetail(APIView):
    site_id = None
    site = None

    def dispatch(self, request, *args, **kwargs):
        slug = kwargs.get('site_slug')
        self.site_id = kwargs.get('site_id')
        if slug:
            try:
                self.site = Site.objects.get(subdomain=slug)
                self.site_id = self.site.id
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден")
        else:
            try:
                self.site = Site.objects.get(id=self.site_id)
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден")
        user = kwargs.get('user')
        if request.method == 'GET':
            return super().dispatch(request, *args, **kwargs)
        elif user and (self.site.creator == user or user.role == User.RoleType.ADMIN):
            return super().dispatch(request, *args, **kwargs)
        else:
            return Response(status=403, content="Нет доступа")

    def get(self, request, *args, **kwargs):
        result = SiteSerializer(self.site, context={"kwargs": kwargs}).data
        return Response(result)

    def put(self, request, *args, **kwargs):
        data = request.data
        if self.site.is_confirmed and kwargs.get('user').role != User.RoleType.ADMIN:
            return Response(status=403, content="Нет доступа")
        serializer = WriteSiteSerializer(self.site, data=data, context={"kwargs": kwargs}, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        if Booking.objects.filter(territory__site__id=self.site.id, status=Booking.BookingStatus.AGREED).exists():
            return Response(status=403, content="Нельзя удалить объект, на который есть подтвержденные брони")
        self.site.delete()
        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AbstractToggleView(APIView):
    is_admin = True
    site_id = None
    site = None
    key = None

    def dispatch(self, request, *args, **kwargs):
        slug = kwargs.get('site_slug')
        user = kwargs.get('user')
        self.site_id = kwargs.get('site_id')
        if slug:
            try:
                self.site = Site.objects.get(subdomain=slug)
                self.site_id = self.site.id
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден")
        else:
            try:
                self.site = Site.objects.get(id=self.site_id)
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден")
        if (self.is_admin and user.role == User.RoleType.ADMIN) or (not self.is_admin and self.site.creator == user):
            return super().dispatch(request, *args, **kwargs)
        else:
            return Response(status=403, content="Нет доступа")

    def post(self, request, *args, **kwargs):
        current_value = getattr(self.site, self.key)
        setattr(self.site, self.key, not current_value)
        try:
            self.site.save()
        except DomainAPIException as error:
            return Response(status=400, content=error.message)
        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SiteViewConfirm(AbstractToggleView):
    is_admin = True
    key = 'is_confirmed'


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SiteViewActive(AbstractToggleView):
    is_admin = False
    key = 'is_active'


class SiteViewBlock(AbstractToggleView):
    is_admin = True
    key = 'is_blocked'


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SubdomainView(APIView):
    site_id = None
    site = None

    def dispatch(self, request, *args, **kwargs):
        slug = kwargs.get('site_slug')
        if slug:
            try:
                self.site = Site.objects.get(subdomain=slug, creator=kwargs.get('user'))
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден или нет доступа")
        else:
            try:
                self.site = Site.objects.get(id=kwargs.get('site_id'), creator=kwargs.get('user'))
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден или нет доступа")
        if self.site.is_confirmed and kwargs.get('user').role != User.RoleType.ADMIN:
            return Response(status=403, content="Нельзя изменить поддомен у подтвержденного объекта")
        return super().dispatch(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        data = request.data
        subdomain = data.get('subdomain')
        url = f"https://{subdomain}.bookingin.moscow"
        if not url:
            return Response(status=400, content="Не указан url")
        try:
            validate = URLValidator()
            validate(url)
        except Exception as e:
            return Response(status=400, content="Некорректный url")
        if subdomain in ['api', 'www', 'bookingin', 'admin', 'maps', '_acme-challenge', 'mail', 's3',
                         'mail._domainkey.mail', 'mail._domainkey', 'id']:
            return Response(status=400, content="Некорректный поддомен")
        self.site.subdomain = subdomain
        try:
            self.site.save()
        except IntegrityError:
            return Response(status=400, content="Поддомен уже занят")
        return Response(status=204)


class SubdomainRedirectView(APIView):
    site_id = None
    site = None

    def get(self, request, *args, **kwargs):
        subdomain = request.get_host().split('.')[0]
        try:
            self.site = Site.objects.get(subdomain=subdomain, is_confirmed=True, is_active=True, is_blocked=False)
        except (Site.DoesNotExist, ValueError):
            return HttpResponseRedirect(redirect_to=f"https://bookingin.moscow/")
        return HttpResponseRedirect(redirect_to=f"https://bookingin.moscow/place/{self.site.id}")


@method_decorator([tryexcept, log_action], name='dispatch')
class SuggestAddressView(APIView):
    def get(self, request, *args, **kwargs):
        data = request.query_params
        query = data.get('address')
        if not query:
            return Response(status=400, content="Не указан запрос")
        try:
            address_list = suggest_address(query)
        except Exception as e:
            return Response(status=400, content="Ошибка при запросе к внешнему API")
        return Response(address_list)


@method_decorator([tryexcept, log_action], name='dispatch')
class UndergroundView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            address_list = get_underground_stations()
        except Exception as e:
            telegram_message(traceback.format_exc())
            return Response(status=400, content="Ошибка при запросе к внешнему API")
        return Response(address_list)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AiSuggestSites(APIView):
    sites = None
    excluded_fields = None

    def dispatch(self, request, *args, **kwargs):
        self.excluded_fields = ['landing']
        if kwargs.get('is_anonymous'):
            return Response(status=403, content="Нет доступа к функции интеллектуального поиска")
        self.user = kwargs.get('user')
        if self.user.role == User.RoleType.ADMIN:
            self.sites = Site.objects.all()
        else:
            filter_q = Q(is_active=True, is_blocked=False, is_confirmed=True) | Q(creator=self.user)
            self.sites = Site.objects.filter(filter_q)
            self.excluded_fields.extend(['is_active', 'is_blocked', 'is_confirmed', 'created_at', 'updated_at'])
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        data = request.query_params
        query = data.get('search')
        if not query:
            return Response(status=400, content="Не указан запрос")
        try:
            answer, ids = suggest_sites(query)
        except Exception as e:
            telegram_message(traceback.format_exc())
            answer, ids = "Нашел", []
        sites = Site.objects.filter(id__in=ids)
        if self.user.role != User.RoleType.ADMIN:
            sites = sites.filter(Q(is_active=True, is_blocked=False, is_confirmed=True) | Q(creator=self.user))
        try:
            paginator = AbstractPaginator(Site, SiteSerializer, sites, context={"kwargs": kwargs, "is_ai": True},
                                          filter_instance=SiteFilter, request=request,
                                          excluded_fields=self.excluded_fields)
            result = paginator.get_result(filter_kwargs={"user": kwargs.get('user')})
            result['answer'] = answer
        except BadRequestException as error:
            return Response(status=400, content=error.message)
        return Response(result)
