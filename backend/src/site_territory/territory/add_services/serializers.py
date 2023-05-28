from rest_framework import serializers

from site_territory.models import AddService


class AddServiceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')

    class Meta:
        model = AddService
        fields = ['id', 'name', 'description', 'type', 'max_count', 'is_active']
