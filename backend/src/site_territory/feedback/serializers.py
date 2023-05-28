from rest_framework import serializers

from site_territory.models import SiteFeedback
from site_territory.serializers import SiteSerializer
from users.serializers import UserSerializer


class SiteFeedbackSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    site = SiteSerializer(read_only=True, included_fields=['id', 'name', 'image_url'])
    tenant = UserSerializer(read_only=True, included_fields=['id', 'name', 'surname', 'patronymic', 'avatar',
                                                             'avatar_thumbnail_url'])

    class Meta:
        model = SiteFeedback
        fields = ('id', 'site', 'tenant', 'rating', 'text', 'created_at', 'updated_at', 'landlord_answer')


class WriteSiteFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteFeedback
        fields = ('rating', 'text')
