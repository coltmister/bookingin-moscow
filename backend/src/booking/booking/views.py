import datetime

from dateutil.relativedelta import relativedelta
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.booking.exceptions import BookingStatusError
from booking.booking.filters import BookingFilter
from booking.booking.serializers import BookingReadSerializer, BookingWriteSerializer
from booking.booking.services import change_booking_status
from booking.models import Booking
from core.utils.decorators import auth, tryexcept, log_action
from core.utils.exceptions import BadRequestException
from core.utils.http import Response
from core.utils.paginators import AbstractPaginator
from site_territory.models import Territory


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class MyBookingView(APIView):
    def get(self, request, *args, **kwargs):
        """Вернуть список моих бронирований"""
        user = kwargs.get('user')
        booked_slots = Booking.objects.filter(tenant=user)

        try:
            paginator = AbstractPaginator(Booking, BookingReadSerializer, booked_slots,
                                          filter_instance=BookingFilter,
                                          context={"kwargs": kwargs}, request=request)
            result = paginator.get_result(
                search_list=[
                    'territory__category__name__search',
                    'territory__category__name__icontains',
                    'territory__name__search',
                    'territory__name__icontains',
                    'territory__description__icontains',
                    'territory__description__search',
                    'services__name__search',
                    'services__name__icontains',
                    'services__description__search',
                    'services__description__icontains'],
                filter_kwargs={"user": user},
            )
        except BadRequestException as error:
            return Response(status=400, content=error.message)

        return Response(result)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class BookingView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.is_admin:
            booked_slots = Booking.objects.filter(territory=self.territory.id)
        elif user.is_landlord:
            booked_slots = Booking.objects.filter(
                territory=self.territory.id,
                territory__site__creator=user
            )
        else:
            return Response(status=403, content={'message': 'Недостаточно прав'})

        try:
            paginator = AbstractPaginator(Booking, BookingReadSerializer, booked_slots,
                                          filter_instance=BookingFilter,
                                          context={"kwargs": kwargs}, request=request)
            result = paginator.get_result(
                search_list=[
                    'territory__category__name__search',
                    'territory__category__name__icontains',
                    'territory__name__search',
                    'territory__name__icontains',
                    'territory__description__icontains',
                    'territory__description__search',
                    'services__name__search',
                    'services__name__icontains',
                    'services__description__search',
                    'services__description__icontains'],
                filter_kwargs={"user": user},
            )
        except BadRequestException as error:
            return Response(status=400, content=error.message)

        return Response(result)

    def post(self, request, *args, **kwargs):
        tenant = kwargs.get('user')
        if not tenant.is_tenant:
            return Response(status=403, content={'message': 'Недостаточно прав'})
        request.data['territory'] = self.territory.id
        serializer = BookingWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        created_booking = serializer.save(tenant=tenant,
                                          status=Booking.BookingStatus.PENDING,
                                          territory=self.territory,
                                          is_offer_signed=False)
        return Response(status=201, content={"id": str(created_booking.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class BookingDetailView(APIView):
    territory = None
    booking = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        user = kwargs.get('user')
        if user.is_tenant:
            try:
                self.booking = Booking.objects.get(
                    id=kwargs.get('booking_id'),
                    territory=self.territory.id,
                    tenant=user
                )
            except ObjectDoesNotExist:
                return Response(status=404, content={'message': 'Бронирование не найдено'})
        elif user.is_landlord:
            try:
                self.booking = Booking.objects.get(
                    id=kwargs.get('booking_id'),
                    territory=self.territory.id,
                    territory__site__creator=user
                )
            except ObjectDoesNotExist:
                return Response(status=404, content={'message': 'Бронирование не найдено'})
        else:
            try:
                self.booking = Booking.objects.get(
                    id=kwargs.get('booking_id'),
                    territory=self.territory.id
                )
            except ObjectDoesNotExist:
                return Response(status=404, content={'message': 'Бронирование не найдено'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        serializer = BookingReadSerializer(self.booking, context={'kwargs': kwargs})
        return Response(status=200, content=serializer.data)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class ChangeBookingStatusView(APIView):
    booking = None

    def dispatch(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.is_tenant:
            try:
                self.booking = Booking.objects.get(
                    id=kwargs.get('booking_id'),
                    tenant=user
                )
            except ObjectDoesNotExist:
                return Response(status=404, content={'message': 'Бронирование не найдено'})
        elif user.is_landlord:
            try:
                self.booking = Booking.objects.get(
                    id=kwargs.get('booking_id'),
                    territory__site__creator=user
                )
            except ObjectDoesNotExist:
                return Response(status=404, content={'message': 'Бронирование не найдено'})
        else:
            try:
                self.booking = Booking.objects.get(
                    id=kwargs.get('booking_id'),
                )
            except ObjectDoesNotExist:
                return Response(status=404, content={'message': 'Бронирование не найдено'})
        return super().dispatch(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        user = kwargs.get('user')
        status = request.data.get('status')
        if not status:
            return Response(status=400, content={'message': 'Укажите статус'})
        try:
            change_booking_status(user, self.booking, status)
            return Response(status=204)
        except BookingStatusError as error:
            return Response(status=400, content={'message': error.message})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AvailableTimeSlotsView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        date = request.GET.get('date')
        if not date:
            return Response(status=400, content={'message': 'Укажите дату'})
        date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
        available_time_slots = self.territory.get_available_time_slots(date)
        return Response(status=200, content=available_time_slots)


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AvailableDatesView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        try:
            self.territory = Territory.objects.get(id=kwargs.get('territory_id'))
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Территория не найдена'})

        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        month = request.GET.get('month')
        if not month:
            return Response(status=400, content={'message': 'Укажите месяц'})
        try:
            month = int(month)
        except ValueError:
            return Response(status=400, content={'message': 'Неверный формат месяца'})
        if month not in [i for i in range(1, 13)]:
            return Response(status=400, content={'message': 'Неверный формат месяца'})
        year = request.GET.get('year')
        if not year:
            return Response(status=400, content={'message': 'Укажите год'})
        if len(year) != 4:
            return Response(status=400, content={'message': 'Неверный формат года'})
        try:
            year = int(year)
        except ValueError:
            return Response(status=400, content={'message': 'Неверный формат года'})
        if year < datetime.datetime.now().year:
            return Response(status=400, content={'message': 'Нельзя выбрать прошедший год'})

        if year == datetime.datetime.now().year and month == datetime.datetime.now().month:
            start_date = datetime.datetime.today()
        else:
            start_date = datetime.datetime.strptime(f"{year}-{month}", "%Y-%m")

        # Get the last day of the current month
        end_date = start_date + relativedelta(day=31)

        # Generate list of dates from start_date to end_date
        dates = [(start_date + datetime.timedelta(days=i)).date() for i in range((end_date - start_date).days + 1)]

        available_dates = self.territory.get_available_dates(dates)

        return Response(status=200, content=available_dates)
