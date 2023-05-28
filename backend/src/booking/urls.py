from django.urls import path

from booking.booking.tasks import test
from booking.booking.views import BookingDetailView, BookingView, AvailableTimeSlotsView, AvailableDatesView, \
    MyBookingView, ChangeBookingStatusView
from booking.exclusion_days.views import ExclusionDayView, ExclusionDayDetailView
from booking.holiday.views import HolidayView, HolidayDetailView
from booking.offer.views import SignOfferView
from booking.working_hours.views import WorkingHourView, WorkingHourDetailView

urlpatterns = [
    path('test', test),

    path('my-booking', MyBookingView.as_view()),

    path('<uuid:booking_id>/status', ChangeBookingStatusView.as_view()),
    path('<uuid:booking_id>/init-sign-offer', SignOfferView.as_view()),
    path('confirmation/<uuid:confirmation_id>', SignOfferView.as_view()),

    path('territory/<uuid:territory_id>/working-hours', WorkingHourView.as_view()),
    path('territory/<uuid:territory_id>/working-hours/<uuid:working_hour_id>', WorkingHourDetailView.as_view()),

    path('territory/<uuid:territory_id>/exclusion-days', ExclusionDayView.as_view()),
    path('territory/<uuid:territory_id>/exclusion-days/<uuid:exclusion_day_id>', ExclusionDayDetailView.as_view()),

    path('territory/<uuid:territory_id>/holidays', HolidayView.as_view()),
    path('territory/<uuid:territory_id>/holidays/<uuid:holiday_id>', HolidayDetailView.as_view()),

    path('territory/<uuid:territory_id>/booking', BookingView.as_view()),
    path('territory/<uuid:territory_id>/booking/<uuid:booking_id>', BookingDetailView.as_view()),

    path('territory/<uuid:territory_id>/available-time-slots', AvailableTimeSlotsView.as_view()),
    path('territory/<uuid:territory_id>/available-dates', AvailableDatesView.as_view()),

]
