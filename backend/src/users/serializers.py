from django.core.cache import cache
from rest_framework import serializers

from core.utils.serializers import AbstractModelSerializer
from site_territory.utils import suggest_address
from users.models import Company, User


class CompanySerializer(AbstractModelSerializer):
    coords = serializers.SerializerMethodField()

    def get_coords(self, obj):
        if obj.address is None:
            return None
        coords = cache.get(f"{obj.id}_coords")
        if coords:
            return coords
        else:
            try:
                coordinates = suggest_address(obj.address, count=1)[0]
                answer = {
                    "longitude": coordinates['coords']['longitude'],
                    "latitude": coordinates['coords']['latitude']
                }
                cache.set(f"{obj.id}_coords", answer, 60 * 60 * 24)
                return answer
            except:
                return None

    class Meta:
        model = Company
        fields = ['id', 'name', 'address', 'tax_number', 'logo_url', 'offer_url', 'coords']


class UserSerializer(AbstractModelSerializer):
    role = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    def get_role(self, obj):
        return {
            "id": obj.role,
            "name": obj.get_role_display()
        }

    def get_company(self, obj):
        try:
            company = obj.company
        except Company.DoesNotExist:
            return None
        return CompanySerializer(company).data

    class Meta:
        model = User
        fields = ['id', 'role', 'name', 'surname', 'patronymic', 'email', 'phone', 'date_of_birth', 'position',
                  'avatar_url', 'avatar_thumbnail_url', 'company', 'is_active', 'is_verified', 'is_admin']
