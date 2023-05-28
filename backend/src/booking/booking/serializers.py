import datetime
import logging

from rest_framework import serializers

from booking.models import Booking, ChosenAddServices
from core.utils.serializers import AbstractModelSerializer
from site_territory.models import AddService
from site_territory.serializers import UserSerializer, SiteSerializer
from site_territory.territory.serializers import ServiceReadSerializer, TerritoryReadSerializer

logger = logging.getLogger(__name__)


class ChosenAddServicesReadSerializer(AbstractModelSerializer):
    service = ServiceReadSerializer(source='add_service')

    class Meta:
        model = ChosenAddServices
        fields = ('service', 'units', 'is_picked')


class ChosenAddServicesWriteSerializer(AbstractModelSerializer):
    id = serializers.PrimaryKeyRelatedField(queryset=AddService.objects.all(), source='add_service')

    class Meta:
        model = ChosenAddServices
        fields = ('id', 'units', 'is_picked')


class BookingReadSerializer(AbstractModelSerializer):
    territory = TerritoryReadSerializer(excluded_fields=['site'])
    services = serializers.SerializerMethodField()
    tenant = UserSerializer(
        included_fields=['id', 'name', 'surname', 'patronymic', 'avatar_url', 'avatar_thumbnail_url'])
    status = serializers.SerializerMethodField()
    offer_url = serializers.SerializerMethodField()
    site = serializers.SerializerMethodField()

    def get_site(self, obj):
        return SiteSerializer(obj.territory.site, context=self.context, excluded_fields=['admin_message']).data

    def get_offer_url(self, obj):
        try:
            return obj.territory.site.creator.company.offer_url
        except Exception as e:
            return None

    def get_services(self, obj):
        return ChosenAddServicesReadSerializer(obj.chosen_add_services, many=True).data

    def get_status(self, obj):
        return {
            "id": obj.status,
            "name": obj.get_status_display()
        }

    class Meta:
        model = Booking
        fields = (
            'id', 'status', 'is_offer_signed', 'territory', 'site', 'cover_letter', 'tenant', 'services', 'date',
            'time_slots', 'offer_url')


class BookingWriteSerializer(AbstractModelSerializer):
    services = ChosenAddServicesWriteSerializer(many=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'status', 'is_offer_signed', 'territory', 'cover_letter', 'tenant', 'services', 'date', 'time_slots')
        read_only_fields = ('id', 'status', 'is_offer_signed', 'tenant')

    def validate(self, attrs):
        territory = attrs.get('territory')
        date = attrs.get('date')
        time_slots = attrs.get('time_slots')

        if not territory.settings.is_working_hours_set:
            raise serializers.ValidationError("В настоящее время площадка не готова для бронирования")

        if not territory.site.is_active or not territory.site.is_confirmed:
            raise serializers.ValidationError("В настоящее время площадка недоступна для бронирования")

        if territory.site.is_blocked:
            raise serializers.ValidationError("В настоящее время площадка заблокирована")

        # Проверяю, что дата бронирования не в прошлом
        if date < datetime.date.today():
            raise serializers.ValidationError("Дата бронирования не может быть в прошлом")

        # Получаю список доступных таймслотов для данной территории
        available_time_slots = territory.get_available_time_slots(date)

        for time_slot in time_slots:
            if time_slot not in available_time_slots:
                raise serializers.ValidationError(
                    f"Время {time_slot['start']}-{time_slot['end']} недоступно для бронирования")

        if len(time_slots) > territory.settings.max_slots:
            raise serializers.ValidationError("Превышено максимальное количество слотов для бронирования")

        return attrs

    def validate_services(self, value):
        # Проверяю выбранные услуги
        territory = self.initial_data['territory']
        for service in value:
            # Проверяю, что услуга принадлежит данной территории
            if service['add_service'].territory.id != territory:
                raise serializers.ValidationError("Данная услуга не доступна для данной территории")
            service_type = service['add_service'].type
            if service_type == AddService.Type.BOOL:
                is_picked = service['is_picked']
                if is_picked is None:
                    raise serializers.ValidationError("Данная услуга имеет логический тип")
                else:
                    service['is_picked'] = True
                    service['units'] = None
            elif service_type == AddService.Type.QUANTITATIVE:
                units = service['units']
                if units is None:
                    raise serializers.ValidationError("Данная услуга имеет количественный тип")
                else:
                    service['is_picked'] = None
                    service['units'] = units

        return value

    def save(self, **kwargs):
        services = self.validated_data.pop('services')
        booking = super().save(**kwargs)

        chosen_add_services = []
        for service in services:
            chosen_add_services.append(ChosenAddServices.objects.create(
                add_service=service['add_service'],
                units=service['units'],
                is_picked=service['is_picked'],
                booking=booking
            ))
        booking.chosen_add_services.set(chosen_add_services)
        # Сохраняю бронирование

        return booking
