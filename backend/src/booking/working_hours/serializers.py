import logging

from rest_framework import serializers

from booking.models import WorkingHour
from booking.working_hours.services import check_working_hours_overlap
from core.utils.serializers import AbstractModelSerializer

logger = logging.getLogger(__name__)


class WorkingHourReadSerializer(AbstractModelSerializer):
    weekday = serializers.SerializerMethodField()

    def get_weekday(self, obj):
        return {
            "id": obj.weekday,
            "name": obj.get_weekday_display()
        }

    class Meta:
        model = WorkingHour
        fields = ('id', 'weekday', 'is_day_off', 'working_hours')


class WorkingHourWriteSerializer(AbstractModelSerializer):
    class Meta:
        model = WorkingHour
        fields = ('id', 'weekday', 'is_day_off', 'working_hours', 'territory')
        validators = [
            serializers.UniqueTogetherValidator(
                queryset=model.objects.all(),
                fields=('weekday', 'territory'),
                message="Для данной территории уже создано расписание рабочего времени для данного дня недели."
            )
        ]

    def validate(self, attrs):
        territory = attrs['territory']
        is_day_off = attrs.get('is_day_off', False)
        working_hours = attrs['working_hours']

        if is_day_off:
            working_hours = attrs['working_hours'] = None

        # Проверка, что working_hours не пересекаются
        if working_hours is not None:
            check_working_hours_overlap(working_hours, territory.settings)

        return attrs

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        # Если все дни недели созданы, то устанавливаем флаг, что территория готова к бронированию
        if WorkingHour.objects.filter(territory=instance.territory).count() == 7:
            instance.territory.settings.is_working_hours_set = True
            instance.territory.settings.save()
        return instance
