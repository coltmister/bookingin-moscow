from django.contrib.gis.geos import Point
from django.core.cache import cache
from rest_framework import serializers

from core.utils.serializers import AbstractModelSerializer
from site_territory.models import Category, Site, SitePhoto
from site_territory.utils import get_underground_stations
from users.serializers import UserSerializer


class CategorySerializer(AbstractModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    urls = serializers.JSONField(read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', "urls"]


class SiteSerializer(AbstractModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    creator = UserSerializer(read_only=True, included_fields=['id', 'name', 'surname', 'patronymic', 'avatar_url',
                                                              'avatar_thumbnail_url'])
    categories = serializers.SerializerMethodField()
    coords = serializers.SerializerMethodField()
    underground = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    feedback_count = serializers.SerializerMethodField()
    is_ai_generated = serializers.SerializerMethodField()

    def get_is_ai_generated(self, instance):
        is_ai = self.context.get('is_ai')
        if is_ai:
            return True
        else:
            return False

    def get_feedback_count(self, instance):

        return instance.feedbacks.count() if instance.feedbacks else 0

    def get_image_url(self, instance):
        url = SitePhoto.objects.filter(site=instance).order_by('created_at').first()
        if url:
            return url.get_url()
        else:
            return None

    def get_underground(self, instance):
        if instance.underground is None:
            return None
        underground_dict = cache.get('underground_dict1')
        if not underground_dict:
            underground_dict = get_underground_stations(return_dict=True)
        return {
            "id": instance.underground,
            "name": underground_dict[int(instance.underground)]['name'],
            "line": underground_dict[int(instance.underground)]['line']
        }

    def get_coords(self, instance):
        if instance.coords and instance.coords:
            return {
                "latitude": float(instance.coords.y),
                "longitude": float(instance.coords.x)
            }
        else:
            return None

    def get_categories(self, instance):
        territories = instance.territories.all()
        if territories:
            categories = territories.values('category').distinct()
            return CategorySerializer(Category.objects.filter(id__in=categories),
                                      many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if (current_user := self.context['kwargs'].get('user')) is not None:
            user_site = instance.creator == current_user
            if user_site:
                data['is_creator'] = True
                data['is_confirmed'] = instance.is_confirmed
                data['is_active'] = instance.is_active
                data['is_blocked'] = instance.is_blocked
        return data

    class Meta:
        model = Site
        fields = '__all__'


class WriteSiteSerializer(AbstractModelSerializer):

    def to_internal_value(self, data):
        coords = data.get('coords')
        if coords:
            latitude = coords.get('latitude')
            longitude = coords.get('longitude')
            point = Point(float(longitude), float(latitude))  # Note that longitude comes before latitude
            data['coords'] = point
        return super().to_internal_value(data)

    class Meta:
        model = Site
        fields = ['id', 'name', 'brief_description', 'landing', 'url', 'email', 'address', 'coords', 'underground',
                  'start_time', 'end_time']
