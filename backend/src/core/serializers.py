from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from core.models import Draft
from iam.models import LogoutUser


class LogoutUserConsumerSerializer(serializers.ModelSerializer):
    class Meta:
        model = LogoutUser
        fields = ['id', 'user', 'session_id', 'iat_before', 'logout_type']


class DraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Draft
        fields = ['id', 'key', 'user', 'expiration_date', 'data']
        extra_kwargs = {"user": {"allow_null": True, "required": False, "write_only": True}}

    def create(self, validated_data):
        user = validated_data.get('user')
        key = validated_data.get('key')
        try:
            draft = Draft.objects.get(user=user, key=key)
        except ObjectDoesNotExist:
            super().create(validated_data)
            return True
        super().update(draft, validated_data)
        return False
