import logging

from rest_framework import serializers

from booking.models import ExclusionDay
from booking.working_hours.services import check_working_hours_overlap
from core.utils.serializers import AbstractModelSerializer

logger = logging.getLogger(__name__)


class ExclusionDayReadSerializer(AbstractModelSerializer):
    class Meta:
        model = ExclusionDay
        fields = ('id', 'date', 'working_hours')


class ExclusionDayWriteSerializer(AbstractModelSerializer):
    class Meta:
        model = ExclusionDay
        fields = ('id', 'date', 'working_hours', 'territory')
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=('date', 'territory'),
                message="Для данной территории уже создано особое расписание рабочего времени на эту дату."
            )
        ]

    def validate(self, attrs):
        territory = attrs['territory']

        if attrs['working_hours'] is None:
            raise serializers.ValidationError('Необходимо указать рабочее время. Данный день не является выходным')

        # Проверка, что working_hours не пересекаются
        working_hours = attrs['working_hours']
        if working_hours is not None:
            check_working_hours_overlap(working_hours, territory.settings)

        return attrs
