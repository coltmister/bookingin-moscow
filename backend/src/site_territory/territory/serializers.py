from rest_framework import serializers

from core.utils.serializers import AbstractModelSerializer
from site_territory.models import AddService, Territory, TerritorySettings, TerritoryPhoto
from site_territory.serializers import CategorySerializer, SiteSerializer


class TerritoryReadSerializer(AbstractModelSerializer):
    site = SiteSerializer()
    category = CategorySerializer()
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        url = TerritoryPhoto.objects.filter(territory=obj).order_by('created_at').first()
        if url:
            return url.get_url()
        else:
            return None

    class Meta:
        model = Territory
        fields = ['id', 'name', 'brief_description', 'description', 'price', 'category', 'site', 'image_url']


class ServiceReadSerializer(AbstractModelSerializer):
    type = serializers.SerializerMethodField()

    def get_type(self, instance):
        return {
            "id": instance.type,
            "name": instance.get_type_display()
        }

    class Meta:
        model = AddService
        fields = ['id', 'name', 'description', 'type', 'max_count', 'is_active']


class WriteTerritorySerializer(AbstractModelSerializer):
    class Meta:
        model = Territory
        fields = ['id', 'name', 'brief_description', 'description', 'price', 'category']


class TerritorySettingsSerializer(AbstractModelSerializer):
    id = serializers.UUIDField(read_only=True)
    is_working_hours_set = serializers.BooleanField(read_only=True)
    territory = TerritoryReadSerializer(read_only=True)

    class Meta:
        model = TerritorySettings
        fields = ['id', 'duration', 'max_slots', 'is_working_hours_set', 'external_name', 'calendar_url', 'territory',
                  'booking_calendar_url']
