from django.contrib import admin

from booking.models import Booking, ConfirmationCode, WorkingHour, ExclusionDay, Holiday, ChosenAddServices, \
    ExternalEvent
from core.admin import AbstractAdmin


# Register your models here.
class BookingAdmin(AbstractAdmin):
    class ChosenAddServicesInline(admin.TabularInline):
        model = ChosenAddServices
        extra = 1

    list_display = ('id', 'status', 'is_offer_signed', 'time_slots', 'territory', 'tenant')
    search_fields = ('territory__name',)
    list_per_page = 25
    inlines = [ChosenAddServicesInline]


admin.site.register(Booking, BookingAdmin)


class ExternalEventAdmin(AbstractAdmin):
    list_display = ('id', 'event_date', 'event_uid', 'event_name', 'territory')
    search_fields = ('territory__id',)
    list_per_page = 25


admin.site.register(ExternalEvent, ExternalEventAdmin)


class ConfirmationCodeAdmin(AbstractAdmin):
    list_display = ('id', 'type', 'code', 'is_used', 'use_until', 'attempt_count', 'booking')
    search_fields = ('booking__id',)
    list_per_page = 25


admin.site.register(ConfirmationCode, ConfirmationCodeAdmin)


class WorkingHourAdmin(AbstractAdmin):
    list_display = ('id', 'weekday', 'working_hours', 'territory')
    search_fields = ('territory__id',)
    list_per_page = 25


admin.site.register(WorkingHour, WorkingHourAdmin)


class ExclusionDayAdmin(AbstractAdmin):
    list_display = ('id', 'date', 'working_hours', 'territory')
    search_fields = ('territory__id',)
    list_per_page = 25


admin.site.register(ExclusionDay, ExclusionDayAdmin)


class HolidayAdmin(AbstractAdmin):
    list_display = ('id', 'date', 'territory')
    search_fields = ('territory__id',)
    list_per_page = 25


admin.site.register(Holiday, HolidayAdmin)
