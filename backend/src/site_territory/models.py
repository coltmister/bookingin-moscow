import datetime
import traceback
import uuid

from django.contrib.gis.db import models as geomodels
from django.contrib.gis.db.models import PointField
from django.contrib.gis.geos import Point
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from booking.models import ExternalEvent
from core.models import AbstractBase
from core.utils.notification import telegram_message
from settings.settings import S3_CALENDARS_BUCKET, S3_SERVER, S3_SITE_DOCS_BUCKET
from site_territory.tasks import send_new_feedback_email, send_site_confirmation_email
from site_territory.utils import set_domain_name, suggest_address


class DomainAPIException(Exception):
    def __init__(self, message="Произошла внутренняя ошибка"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"


class Category(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name='Название')
    urls = models.JSONField(verbose_name='URL', null=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class AddField(AbstractBase):
    class Type(models.IntegerChoices):
        BOOL = 1, 'Bool'
        STR = 2, 'Str'
        INT = 3, 'Int'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey('Category', on_delete=models.CASCADE, verbose_name='Категория', related_name='fields')
    name = models.CharField(max_length=255, verbose_name='Название')
    type = models.IntegerField(choices=Type.choices, verbose_name='Тип')
    choices = models.JSONField(verbose_name='Варианты', null=True, blank=True)

    class Meta:
        verbose_name = 'Дополнительное поле'
        verbose_name_plural = 'Дополнительные поля'

    def __str__(self):
        return self.name


class AddFieldValue(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    add_field = models.ForeignKey('AddField', on_delete=models.CASCADE, verbose_name='Дополнительное поле')
    value = models.JSONField(max_length=255, verbose_name='Значение')
    territory = models.ForeignKey('Territory', on_delete=models.CASCADE, verbose_name='Территория',
                                  related_name='add_fields_values')

    class Meta:
        verbose_name = 'Значение дополнительного поля'
        verbose_name_plural = 'Значения дополнительных полей'

    def __str__(self):
        return f"{self.add_field.name} - {self.value}"


class Site(geomodels.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name='Название')
    brief_description = models.TextField(verbose_name='Краткое описание')
    landing = models.JSONField(verbose_name='Лендинг', blank=True, null=True)
    subdomain = models.SlugField(verbose_name='Субдомен', unique=True, null=True, blank=True)
    url = models.URLField(verbose_name='Ссылка', null=True, blank=True)
    email = models.EmailField(verbose_name='Почта', null=True, blank=True)

    address = models.CharField(max_length=1000, verbose_name='Адрес')
    coords = PointField(verbose_name='Координаты', null=True, blank=True, srid=4326)
    underground = models.IntegerField(verbose_name='Станция метро', null=True, blank=True)
    start_time = models.TimeField(verbose_name='Время начала работы', null=True, blank=True,
                                  default=datetime.time(8, 0))
    end_time = models.TimeField(verbose_name='Время окончания работы', null=True, blank=True,
                                default=datetime.time(18, 0))

    rating = models.FloatField(verbose_name='Рейтинг', default=0)

    creator = models.ForeignKey('users.User', on_delete=models.CASCADE, verbose_name='Создатель')

    is_active = models.BooleanField(verbose_name='Активен', default=True)
    is_blocked = models.BooleanField(verbose_name='Заблокирован', default=False)
    is_confirmed = models.BooleanField(verbose_name='Подтвержден', default=None, null=True, blank=True)
    admin_message = models.TextField(verbose_name='Сообщение администратора', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    class Meta:
        verbose_name = 'Площадка'
        verbose_name_plural = 'Площадки'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        is_creating = False
        if self._state.adding:
            is_creating = True
        try:
            if self.coords is None:
                coordinates = suggest_address(self.address, count=1)[0]
                self.coords = Point(float(coordinates['coords']['longitude']), float(coordinates['coords']['latitude']))
            else:
                pass
        except:
            telegram_message(traceback.format_exc())
        if not is_creating and self.is_confirmed and self.__class__.objects.get(
                id=self.id).is_confirmed != self.is_confirmed:
            if self.subdomain:
                try:
                    set_domain_name(self.subdomain)
                except Exception as e:
                    raise DomainAPIException(f"Не удалось установить домен {self.subdomain} для площадки {self.name}")
            self.admin_message = None
            send_site_confirmation_email.apply_async(kwargs={
                "site_id": str(self.id),
            })
        super(Site, self).save(*args, **kwargs)


class Territory(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name='Название')
    brief_description = models.TextField(verbose_name='Краткое описание')
    description = models.TextField(verbose_name='Описание')
    price = models.IntegerField(verbose_name='Цена')
    category = models.ForeignKey('Category', on_delete=models.CASCADE, verbose_name='Категория',
                                 related_name='territories')
    site = models.ForeignKey('Site', on_delete=models.CASCADE, verbose_name='Площадка', related_name='territories')

    class Meta:
        verbose_name = 'Территория'
        verbose_name_plural = 'Территории'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        is_creating = False
        if self._state.adding:
            is_creating = True
        super(Territory, self).save(*args, **kwargs)
        if not TerritorySettings.objects.filter(territory=self).exists():
            TerritorySettings.objects.create(territory=self)

    def get_add_fields(self):
        return AddField.objects.filter(category=self.category)

    def get_add_field_values(self):
        return AddFieldValue.objects.filter(territory=self)

    def get_add_field_value(self, add_field):
        return self.get_add_field_values().filter(add_field=add_field).first()

    @staticmethod
    def split_time_slots(time_slots, duration):
        new_slots = []

        for time_slot in time_slots:
            start_minutes = int(time_slot["start"].split(':')[0]) * 60 + int(time_slot["start"].split(':')[1])
            end_minutes = int(time_slot["end"].split(':')[0]) * 60 + int(time_slot["end"].split(':')[1])

            while start_minutes < end_minutes:
                new_end_minutes = min(start_minutes + duration, end_minutes)
                new_slot = {
                    "start": f'{start_minutes // 60:02d}:{start_minutes % 60:02d}',
                    "end": f'{new_end_minutes // 60:02d}:{new_end_minutes % 60:02d}'
                }
                new_slots.append(new_slot)
                start_minutes = new_end_minutes

        return new_slots

    @staticmethod
    def exclude_reserved_time_slots(time_slots, reserved_time_slots):
        available_slots = []

        for slot in time_slots:
            slot_start = int(slot["start"].split(':')[0]) * 60 + int(slot["start"].split(':')[1])
            slot_end = int(slot["end"].split(':')[0]) * 60 + int(slot["end"].split(':')[1])

            overlap = False

            for reserved_slot in reserved_time_slots:
                reserved_start = int(reserved_slot["start"].split(':')[0]) * 60 + int(
                    reserved_slot["start"].split(':')[1])
                reserved_end = int(reserved_slot["end"].split(':')[0]) * 60 + int(reserved_slot["end"].split(':')[1])

                if slot_start < reserved_end and slot_end > reserved_start:
                    overlap = True
                    break

            if not overlap:
                available_slots.append(slot)

        return available_slots

    def get_available_time_slots(self, date: datetime.date):
        """Получить список доступных слотов на заданную дату"""
        from booking.models import Booking, Holiday

        if date < datetime.date.today():
            return []

        # Если день праздничный, то возвращаем пустой список
        if Holiday.is_holiday(date, self):
            return []

        exclusion_day = self.exclusion_days.filter(date=date)
        if exclusion_day.exists():
            exclusion_day = exclusion_day.first()
            working_hours = exclusion_day.working_hours
        else:
            # Формируем доступные слоты
            date_weekday = date.weekday()
            # Если рабочее время не установлено, то возвращаем пустой список
            if not self.settings.is_working_hours_set:
                return []

            working_hours = self.working_hours.filter(weekday=date_weekday).first()
            # Если день выходной, то возвращаем пустой список
            if working_hours.is_day_off:
                return []
            else:
                working_hours = working_hours.working_hours

        working_time_slots = self.split_time_slots(working_hours, self.settings.duration)

        reserved_slots = Booking.objects.filter(
            territory=self,
            date=date,
            status__in=[Booking.BookingStatus.AGREED, Booking.BookingStatus.SIGNED, Booking.BookingStatus.SUCCEEDED]
        )

        external_events_slots = ExternalEvent.objects.filter(
            territory=self,
            event_date=date,
        )

        reserved_time_slots_list = []
        for reserved_slot in reserved_slots:
            reserved_time_slots_list.extend(reserved_slot.time_slots)

        for external_event in external_events_slots:
            reserved_time_slots_list.extend(external_event.time_slots)

        available_time_slots = self.exclude_reserved_time_slots(working_time_slots, reserved_time_slots_list)
        available_time_slots.sort(key=lambda x: x["start"])
        return available_time_slots

    def get_available_dates(self, dates):
        """Получить список доступных дат из списка дат"""
        available_dates = {}
        for date in dates:
            if self.get_available_time_slots(date):
                available_dates[str(date)] = True
            else:
                available_dates[str(date)] = False
        return available_dates

    def check_availability(self, date: datetime.date):
        """Проверить доступность территории на заданную дату"""
        return bool(self.get_available_time_slots(date))


class TerritorySettings(AbstractBase):
    class CalendarType(models.IntegerChoices):
        GOOGLE = 1, 'Google'
        YANDEX = 2, 'Yandex'
        APPLE = 3, 'Apple'
        BITRIX = 4, 'Bitrix'

    territory = models.OneToOneField('Territory',
                                     on_delete=models.CASCADE,
                                     verbose_name='Территория',
                                     related_name='settings')
    duration = models.IntegerField(verbose_name='Длительность сессии (мин)', default=60)
    max_slots = models.IntegerField(verbose_name='Максимальное количество слотов', default=5)
    is_working_hours_set = models.BooleanField(verbose_name='Установлены ли рабочие часы?', default=False)
    external_name = models.CharField(max_length=255,
                                     verbose_name='Название для внешнего использования',
                                     null=True,
                                     blank=True)
    calendar_url = models.URLField(verbose_name='Ссылка на календарь', null=True, blank=True)
    calendar_type = models.IntegerField(verbose_name='Тип календаря', choices=CalendarType.choices,
                                        default=CalendarType.GOOGLE)
    booking_calendar = models.UUIDField(verbose_name='Календарь бронирования', null=True, blank=True)

    class Meta:
        verbose_name = 'Настройки территории'
        verbose_name_plural = 'Настройки территорий'

    def __str__(self):
        return self.territory.name

    @property
    def booking_calendar_url(self):
        if self.booking_calendar:
            return f"https://{S3_CALENDARS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.booking_calendar}.ics"
        else:
            return None


class SitePhoto(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey('Site', on_delete=models.CASCADE, verbose_name='Площадка', related_name='photos')
    file_name = models.CharField(max_length=500)  # UUID для S3

    class Meta:
        verbose_name = 'Фото площадки'
        verbose_name_plural = 'Фото площадок'

    def __str__(self):
        return str(self.file_name)

    def get_url(self):
        url = f"https://{S3_SITE_DOCS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.file_name}"
        return url


class SiteFile(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    site = models.ForeignKey('Site', on_delete=models.CASCADE, verbose_name='Площадка', related_name='files')
    file_name = models.CharField(max_length=500)  # UUID для S3

    class Meta:
        verbose_name = 'Файл площадки'
        verbose_name_plural = 'Файлы площадок'

    def __str__(self):
        return str(self.file_name)

    def get_url(self):
        url = f"https://{S3_SITE_DOCS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.file_name}"
        return url


class TerritoryPhoto(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    territory = models.ForeignKey('Territory', on_delete=models.CASCADE, verbose_name='Территория',
                                  related_name='photos')
    file_name = models.CharField(max_length=500)  # UUID для S3

    class Meta:
        verbose_name = 'Фото территории'
        verbose_name_plural = 'Фото территорий'

    def __str__(self):
        return str(self.file_name)

    def get_url(self):
        url = f"https://{S3_SITE_DOCS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.file_name}"
        return url


class TerritoryFile(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    territory = models.ForeignKey('Territory', on_delete=models.CASCADE, verbose_name='Территория',
                                  related_name='files')
    file_name = models.CharField(max_length=500)  # UUID для S3

    class Meta:
        verbose_name = 'Файл территории'
        verbose_name_plural = 'Файлы территорий'

    def __str__(self):
        return str(self.file_name)

    def get_url(self):
        url = f"https://{S3_SITE_DOCS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.file_name}"
        return url


class AddService(AbstractBase):
    class Type(models.TextChoices):
        BOOL = 'bool', 'Логический'
        QUANTITATIVE = 'quantitative', 'Количественный'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(verbose_name='Описание', null=True)
    type = models.CharField(max_length=255, verbose_name='Тип', choices=Type.choices, default=Type.BOOL)
    max_count = models.IntegerField(verbose_name='Максимальное количество', null=True, blank=True)
    is_active = models.BooleanField(verbose_name='Активна', default=True)

    territory = models.ForeignKey('Territory', on_delete=models.CASCADE, verbose_name='Территория',
                                  related_name='add_services')

    class Meta:
        verbose_name = 'Доп. услуга'
        verbose_name_plural = 'Доп. услуги'

    def __str__(self):
        return self.name


class SiteFeedback(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tenant = models.ForeignKey('users.User', on_delete=models.CASCADE, verbose_name='Арендатор',
                               related_name='feedbacks')
    site = models.ForeignKey('Site', on_delete=models.CASCADE, verbose_name='Площадка', null=True, blank=True,
                             related_name='feedbacks')
    text = models.TextField(verbose_name='Текст отзыва')
    rating = models.IntegerField(verbose_name='Рейтинг', validators=[MinValueValidator(1), MaxValueValidator(5)])
    landlord_answer = models.TextField(verbose_name='Ответ арендодателя', null=True, blank=True)

    class Meta:
        verbose_name = 'Обратная связь'
        verbose_name_plural = 'Обратная связь'
        unique_together = ('tenant', 'site')

    def __str__(self):
        return f"{self.tenant} - {self.site} - {self.rating}"

    def save(self, *args, **kwargs):
        is_created = self._state.adding

        if is_created:
            self.site.rating = (self.site.rating * self.site.feedbacks.count() + self.rating) / (
                    self.site.feedbacks.count() + 1)
            self.site.save()

        else:
            old_rating = self.__class__.objects.get(pk=self.pk).rating
            self.site.rating = (self.site.rating * self.site.feedbacks.count() - old_rating + self.rating) / (
                self.site.feedbacks.count())
            self.site.save()
        super().save(*args, **kwargs)
        if is_created:
            send_new_feedback_email.apply_async(countdown=10, kwargs={
                "feedback_id": str(self.id),
            })

    def delete(self, *args, **kwargs):
        if self.site.feedbacks.count() - 1 > 0:
            self.site.rating = (self.site.rating * self.site.feedbacks.count() - self.rating) / (
                    self.site.feedbacks.count() - 1)
        else:
            self.site.rating = 0
        self.site.save()
        super().delete(*args, **kwargs)
