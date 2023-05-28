from rest_framework import serializers

from site_territory.models import SiteFile, SitePhoto, TerritoryFile, TerritoryPhoto
from site_territory.serializers import SiteSerializer
from site_territory.territory.serializers import TerritoryReadSerializer


class AbstractSiteFileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    site = SiteSerializer(included_fields=['id', 'name', 'address'])

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['url'] = instance.get_url()

        return representation


class AbstractTerritoryFileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    territory = TerritoryReadSerializer(included_fields=['id', 'name', 'category'])

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['url'] = instance.get_url()

        return representation


class SitePhotoSerializer(AbstractSiteFileSerializer):
    class Meta:
        model = SitePhoto
        fields = ('id', 'site', 'file_name', 'created_at', 'updated_at')


class SiteFileSerializer(AbstractSiteFileSerializer):
    class Meta:
        model = SiteFile
        fields = ('id', 'site', 'file_name', 'created_at', 'updated_at')


class TerritoryPhotoSerializer(AbstractTerritoryFileSerializer):
    class Meta:
        model = TerritoryPhoto
        fields = ('id', 'territory', 'file_name', 'created_at', 'updated_at')


class TerritoryFileSerializer(AbstractTerritoryFileSerializer):
    class Meta:
        model = TerritoryFile
        fields = ('id', 'territory', 'file_name', 'created_at', 'updated_at')
