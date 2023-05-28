from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.exclusion_days.serializers import ExclusionDayReadSerializer, ExclusionDayWriteSerializer
from booking.models import ExclusionDay
from core.utils.decorators import auth, tryexcept, log_action
from core.utils.http import Response
from site_territory.models import Territory


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ExclusionDayView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        exclusion_days = ExclusionDay.objects.filter(territory=self.territory.id)
        serializer = ExclusionDayReadSerializer(exclusion_days, many=True)
        return Response(status=200, content=serializer.data)

    def post(self, request, *args, **kwargs):
        request.data['territory'] = self.territory.id
        serializer = ExclusionDayWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created_exclusion_day = serializer.save()
        return Response(status=201, content={"id": str(created_exclusion_day.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ExclusionDayDetailView(APIView):
    territory = None
    exclusion_day = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        try:
            self.exclusion_day = ExclusionDay.objects.get(
                id=kwargs.get('exclusion_day_id'),
                territory=self.territory.id
            )
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'День исключение не найден'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = ExclusionDayReadSerializer(self.exclusion_day)
        return Response(status=200, content=serializer.data)

    def put(self, request, *args, **kwargs):
        request.data['territory'] = self.territory.id
        serializer = ExclusionDayWriteSerializer(data=request.data, instance=self.exclusion_day)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        self.exclusion_day.delete()
        return Response(status=204)
