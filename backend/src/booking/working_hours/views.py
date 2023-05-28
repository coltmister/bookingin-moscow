from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.models import WorkingHour
from booking.working_hours.serializers import WorkingHourReadSerializer, WorkingHourWriteSerializer
from core.utils.decorators import auth, tryexcept, log_action
from core.utils.http import Response
from site_territory.models import Territory


# Create your views here.

@auth
def test(request, *args, **kwargs):
    return Response({'message': 'Hello, world!'})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class WorkingHourView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        working_hours = WorkingHour.objects.filter(territory=self.territory.id).order_by('weekday')
        serializer = WorkingHourReadSerializer(working_hours, many=True)
        return Response(status=200, content=serializer.data)

    def post(self, request, *args, **kwargs):
        request.data['territory'] = self.territory.id
        serializer = WorkingHourWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created_weekday = serializer.save()
        return Response(status=201, content={"id": str(created_weekday.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class WorkingHourDetailView(APIView):
    territory = None
    working_hour = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        try:
            self.working_hour = WorkingHour.objects.get(
                id=kwargs.get('working_hour_id'),
                territory=self.territory.id
            )
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Рабочее время не найдено'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = WorkingHourReadSerializer(self.working_hour)
        return Response(status=200, content=serializer.data)

    def put(self, request, *args, **kwargs):
        request.data['territory'] = self.territory.id
        serializer = WorkingHourWriteSerializer(data=request.data, instance=self.working_hour)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)
