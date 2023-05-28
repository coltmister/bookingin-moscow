import random
import string
import uuid

from django.db import models

from booking.services import change_event_in_booking_calendar, add_event_to_booking_calendar
from core.models import AbstractBase


# Create your models here.

class ChosenAddServices(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    add_service = models.ForeignKey('site_territory.AddService', on_delete=models.CASCADE, verbose_name="Услуга")
    units = models.IntegerField(verbose_name="Количество ед.", null=True, blank=True)
    is_picked = models.BooleanField(verbose_name="Выбрано?", null=True, blank=True)
    booking = models.ForeignKey(
        'Booking',
        on_delete=models.CASCADE,
        verbose_name="Бронирование",
        related_name="chosen_add_services"
    )


class Booking(AbstractBase):
    class BookingStatus(models.IntegerChoices):
        PENDING = 1, 'Ожидает согласования'
        AGREED = 2, 'Согласовано, ожидает подписания оферты'
        SIGNED = 3, 'Оферта подписана'
        DECLINED = 4, 'Отклонено арендодателем'
        CANCELED = 5, 'Отменено арендатором'
        SUCCEEDED = 6, 'Успешно завершено'

    id = models.UUIDField(
        primary_key=True,
        verbose_name="ID Бронирования",
        default=uuid.uuid4,
        editable=False
    )
    status = models.IntegerField(choices=BookingStatus.choices)

    is_offer_signed = models.BooleanField(default=False, verbose_name="Оферта подписана?")
    territory = models.ForeignKey(
        'site_territory.Territory',
        on_delete=models.CASCADE,
        verbose_name="Территория",
        related_name="bookings"
    )
    tenant = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        verbose_name="Арендатор",
        related_name="bookings"
    )
    cover_letter = models.TextField(null=True, blank=True, verbose_name="Сопроводительное письмо")
    services = models.ManyToManyField(
        to='site_territory.AddService',
        through=ChosenAddServices,
        verbose_name="Услуги",
        blank=True
    )
    date = models.DateField(verbose_name="Дата бронирования")
    time_slots = models.JSONField(verbose_name="Забронированные временные слоты")

    class Meta:
        verbose_name = "Бронирование"
        verbose_name_plural = "Бронирования"
        ordering = ['-created_at']

    def __str__(self):
        return f'Бронирование № {self.id} {self.territory.name} {self.date} {self.get_status_display()}'

    def save(self, *args, **kwargs):
        from booking.booking.tasks import notify_users_via_email_about_status

        is_new = self._state.adding

        previous_booking_status = Booking.objects.get(id=self.id).status if not is_new else None

        super().save(*args, **kwargs)

        if is_new:
            add_event_to_booking_calendar.apply_async(kwargs={"booking_id": str(self.id)})
        else:
            change_event_in_booking_calendar.apply_async(kwargs={"booking_id": str(self.id)})

        if self.status != previous_booking_status or is_new:
            notify_users_via_email_about_status.apply_async(kwargs={"booking_id": str(self.id)})


class ExternalEvent(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_date = models.DateField(verbose_name="Дата события")
    event_uid = models.CharField(max_length=1024, verbose_name="UID события", null=True, blank=True)
    event_name = models.CharField(max_length=1024, verbose_name="Название события")
    time_slots = models.JSONField(verbose_name="Занятые слоты")
    territory = models.ForeignKey(
        'site_territory.Territory',
        on_delete=models.CASCADE,
        verbose_name="Территория",
        related_name="external_calendar_events"
    )

    class Meta:
        verbose_name = "Внешние события"
        verbose_name_plural = "Внешние события"
        ordering = ['-created_at']


class ConfirmationCode(AbstractBase):
    MAX_ATTEMPTS = 3

    class ConfirmationCodeType(models.IntegerChoices):
        CONFIRMATION_VIA_EMAIL = 1, 'Подтверждение через почту'
        CONFIRMATION_VIA_CALL = 2, 'Подтверждение через звонок'

    id = models.UUIDField(primary_key=True,
                          verbose_name="ID Кода подтверждения",
                          default=uuid.uuid4,
                          editable=False)

    type = models.IntegerField(
        verbose_name="Тип кода подтверждения",
        choices=ConfirmationCodeType.choices,
        default=ConfirmationCodeType.CONFIRMATION_VIA_CALL
    )
    code = models.CharField(max_length=255, verbose_name="Код подтверждения", null=True, blank=True)
    is_used = models.BooleanField(default=False, verbose_name="Использован?")
    use_until = models.DateTimeField(verbose_name="Использовать до")
    attempt_count = models.IntegerField(default=0, verbose_name="Количество попыток")

    booking = models.ForeignKey('booking.Booking', on_delete=models.CASCADE, verbose_name="Бронирование")

    class Meta:
        verbose_name = "Код подтверждения"
        verbose_name_plural = "Коды подтверждения"
        ordering = ['-created_at']

    @staticmethod
    def generate_code():
        return ''.join(random.choices(string.digits, k=4))


class WorkingHour(AbstractBase):
    class WeekdayType(models.IntegerChoices):
        MONDAY = 0, 'Понедельник'
        TUESDAY = 1, 'Вторник'
        WEDNESDAY = 2, 'Среда'
        THURSDAY = 3, 'Четверг'
        FRIDAY = 4, 'Пятница'
        SATURDAY = 5, 'Суббота'
        SUNDAY = 6, 'Воскресенье'

    id = models.UUIDField(primary_key=True,
                          verbose_name="ID Расписания рабочего времени",
                          default=uuid.uuid4,
                          editable=False)
    weekday = models.IntegerField(choices=WeekdayType.choices, verbose_name="День недели")
    working_hours = models.JSONField(verbose_name="Рабочее время", null=True, blank=True)
    is_day_off = models.BooleanField(default=False, verbose_name="Выходной?")
    territory = models.ForeignKey(
        'site_territory.Territory',
        on_delete=models.CASCADE,
        verbose_name="Территория",
        related_name="working_hours"
    )

    class Meta:
        verbose_name = "Рабочее время"
        verbose_name_plural = "Рабочее время"
        ordering = ['-created_at']
        unique_together = ['weekday', 'territory']


class ExclusionDay(AbstractBase):
    id = models.UUIDField(
        primary_key=True,
        verbose_name="ID Дня исключения",
        default=uuid.uuid4,
        editable=False
    )
    date = models.DateField(verbose_name="Дата")
    working_hours = models.JSONField(verbose_name="Рабочее время")
    territory = models.ForeignKey(
        'site_territory.Territory',
        on_delete=models.CASCADE,
        verbose_name="Территория",
        related_name="exclusion_days"
    )

    class Meta:
        verbose_name = "День исключение"
        verbose_name_plural = "Дни исключения"
        ordering = ['-created_at']
        unique_together = ['date', 'territory']


class Holiday(AbstractBase):
    id = models.UUIDField(
        primary_key=True,
        verbose_name="ID праздничного дня",
        default=uuid.uuid4,
        editable=False
    )
    date = models.DateField(verbose_name="Дата", null=True, blank=True)
    territory = models.ForeignKey(
        'site_territory.Territory',
        on_delete=models.CASCADE,
        verbose_name="Территория",
        related_name="holidays"
    )

    class Meta:
        verbose_name = "Праздничный день"
        verbose_name_plural = "Праздничные дни"
        ordering = ['-created_at']
        unique_together = ['date', 'territory']

    @staticmethod
    def is_holiday(date, territory):
        if Holiday.objects.filter(date=date, territory=territory).exists():
            return True
        else:
            return False
