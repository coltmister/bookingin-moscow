from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.holiday.serializers import HolidayReadSerializer, HolidayWriteSerializer
from booking.models import Holiday
from core.utils.decorators import auth, tryexcept, log_action
from core.utils.http import Response
from site_territory.models import Territory


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class HolidayView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        holidays = Holiday.objects.filter(territory=self.territory.id)
        serializer = HolidayReadSerializer(holidays, many=True)
        return Response(status=200, content=serializer.data)

    def post(self, request, *args, **kwargs):
        request.data['territory'] = self.territory.id
        serializer = HolidayWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created_holiday = serializer.save()
        return Response(status=201, content={"id": str(created_holiday.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class HolidayDetailView(APIView):
    territory = None
    holiday = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        try:
            self.holiday = Holiday.objects.get(
                id=kwargs.get('holiday_id'),
                territory=self.territory.id
            )
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Праздничный день не найден'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = HolidayReadSerializer(self.holiday)
        return Response(status=200, content=serializer.data)

    def put(self, request, *args, **kwargs):
        request.data['territory'] = self.territory.id
        serializer = HolidayWriteSerializer(data=request.data, instance=self.holiday)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        self.holiday.delete()
        return Response(status=204)
