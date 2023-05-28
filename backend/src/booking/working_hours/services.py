from rest_framework import serializers

from site_territory.models import TerritorySettings


def check_working_hours_overlap(working_hours: list[dict], territory_settings: TerritorySettings) -> bool:
    # Convert the hours to minutes past midnight
    working_intervals = []
    for hour in working_hours:
        start = int(hour["start"].split(':')[0]) * 60 + int(hour["start"].split(':')[1])
        end = int(hour["end"].split(':')[0]) * 60 + int(hour["end"].split(':')[1])

        # Check if start is before end
        if start >= end:
            raise serializers.ValidationError('Время начала должно быть раньше времени окончания')

        working_intervals.append((start, end))

    # Sort the intervals
    working_intervals.sort()

    # Check for overlap
    for i in range(1, len(working_intervals)):
        if working_intervals[i][0] < working_intervals[i - 1][1]:
            raise serializers.ValidationError('Рабочее время не должно пересекаться')

    return False
