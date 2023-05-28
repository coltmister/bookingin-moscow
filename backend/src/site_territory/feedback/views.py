import django_filters
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.models import Booking
from core.utils.decorators import auth, log_action, tryexcept
from core.utils.exceptions import BadRequestException
from core.utils.http import Response
from core.utils.paginators import AbstractPaginator
from site_territory.feedback.serializers import SiteFeedbackSerializer, WriteSiteFeedbackSerializer
from site_territory.models import Site, SiteFeedback


class SiteFeedbackFilter(django_filters.FilterSet):
    my = django_filters.BooleanFilter(method='my_filter')

    def my_filter(self, queryset, name, value):
        if value:
            return queryset.filter(tenant=self.user)
        else:
            return queryset.none()

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    class Meta:
        model = SiteFeedback
        fields = {
            'tenant': ['exact'],
            'rating': ['gte', 'lte'],
            'site': ['exact'],
        }


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SiteFeedbackView(APIView):
    site_id = None
    site = None
    user = None

    def dispatch(self, request, *args, **kwargs):
        if request.method == 'POST':
            self.site_id = kwargs.get('site_id')
            try:
                self.site = Site.objects.get(id=self.site_id)
            except Site.DoesNotExist:
                return Response(status=404, content="Объект не найден")
            self.user = kwargs.get('user')
            bookings = self.user.bookings.filter(territory__site=self.site, status=Booking.BookingStatus.SUCCEEDED)
            if not bookings:
                return Response(status=403, content="Вы не можете оставить отзыв, так как не посещали данный объект")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        try:
            paginator = AbstractPaginator(SiteFeedback, SiteFeedbackSerializer, SiteFeedback.objects.all(),
                                          context={"kwargs": kwargs},
                                          filter_instance=SiteFeedbackFilter, request=request)
            result = paginator.get_result(search_list=['text__search'],
                                          filter_kwargs={"user": kwargs.get('user')})
        except BadRequestException as error:
            return Response(status=400, content=error.message)
        return Response(result)

    def post(self, request, *args, **kwargs):
        data = request.data
        serializer = WriteSiteFeedbackSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(site=self.site, tenant=self.user)
        return Response(status=201, content={'id': str(serializer.instance.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SiteFeedbackDetailView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            feedback = SiteFeedback.objects.get(id=kwargs.get('feedback_id'))
        except SiteFeedback.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        serializer = SiteFeedbackSerializer(feedback)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        try:
            feedback = SiteFeedback.objects.get(id=kwargs.get('feedback_id'), tenant=kwargs.get('user'))
        except SiteFeedback.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        data = request.data
        serializer = WriteSiteFeedbackSerializer(feedback, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        try:
            feedback = SiteFeedback.objects.get(id=kwargs.get('feedback_id'), tenant=kwargs.get('user'))
        except SiteFeedback.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        feedback.delete()
        return Response(status=204)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SiteFeedbackLandlordView(APIView):
    def put(self, request, *args, **kwargs):
        try:
            feedback = SiteFeedback.objects.get(id=kwargs.get('feedback_id'))
        except SiteFeedback.DoesNotExist:
            return Response(status=404, content="Объект не найден")
        if feedback.site.creator != kwargs.get('user'):
            return Response(status=403, content="Вы не можете редактировать отзывы других пользователей")
        data = request.data
        landlord_answer = data.get('landlord_answer')
        if not landlord_answer:
            return Response(status=400, content="Ответ не может быть пустым")
        feedback.landlord_answer = landlord_answer
        feedback.save()
        return Response(status=204)
