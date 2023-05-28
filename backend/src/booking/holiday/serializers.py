import logging

from rest_framework import serializers

from booking.models import Holiday
from core.utils.serializers import AbstractModelSerializer

logger = logging.getLogger(__name__)


class HolidayReadSerializer(AbstractModelSerializer):
    class Meta:
        model = Holiday
        fields = ('id', 'date')


class HolidayWriteSerializer(AbstractModelSerializer):
    class Meta:
        model = Holiday
        fields = ('id', 'date', 'territory')
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=('date', 'territory'),
                message="Для данной территории уже создан праздничный день на эту дату."
            )
        ]

    def validate(self, attrs):
        territory = attrs['territory']
        # TODO проверять, что нельзя создать выходной на день, когда есть бронирования

        return attrs
