import datetime
import re
import traceback
from datetime import datetime, timedelta

import pytz
import requests
from celery import shared_task
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from ics import Calendar

from booking.models import ExternalEvent
from core.utils.email import Email
from core.utils.http import Response
from core.utils.notification import telegram_message
from site_territory.models import Territory, TerritorySettings


def fix_apple_calendar(calendar_text):
    PRODID = 'PRODID: Apple Calendars'
    BEGIN = 'BEGIN:VCALENDAR'

    if 'PRODID' not in calendar_text:
        start = calendar_text.find(BEGIN)
        calendar_text = calendar_text[:start + len(BEGIN)] + '\n' + PRODID + calendar_text[start + len(BEGIN):]

    return calendar_text


def fix_bitrix_calendar(ical):
    ical = ical.replace(';VALUE=DATE-TIME', '')  # remove incorrect date-time value designator
    ical = re.sub(r'(DTSTAMP:\d{8}T\d{6})\d+', r'\1Z', ical)  # correct DTSTAMP fields
    return ical


def get_events(calendar_url, calendar_type):
    # Fetch the .ics file
    response = requests.get(calendar_url)
    response.raise_for_status()  # raise exception if invalid response
    calendar_data = response.text

    if calendar_type == TerritorySettings.CalendarType.APPLE:
        calendar_data = fix_apple_calendar(calendar_data)
    elif calendar_type == TerritorySettings.CalendarType.BITRIX:
        calendar_data = fix_bitrix_calendar(calendar_data)

    calendar = Calendar(calendar_data)

    events = []

    moscow_tz = pytz.timezone('Europe/Moscow')
    today = timezone.now().astimezone(moscow_tz)
    first_day_of_previous_month = today.replace(day=1) - relativedelta(months=1)

    for event in calendar.events:
        # If the event started not earlier than in the previous month
        if event.begin < first_day_of_previous_month:
            continue

        # Get start and end of the event
        start = event.begin.date() if event.all_day else event.begin.astimezone(moscow_tz)
        end = event.end.date() if event.all_day else event.end.astimezone(moscow_tz)

        if event.all_day:
            event_duration = event.duration.days
            for i in range(event_duration):
                event_date = (start + timedelta(days=i)).isoformat()
                events.append([event_date, '00:00', '23:59', event.name, event.uid])
        else:
            while start.date() <= end.date():
                # If event spans multiple days, split it into separate events for each day
                next_day_start = datetime.combine(start.date() + timedelta(days=1), datetime.min.time(),
                                                  tzinfo=moscow_tz)
                event_end = min(end, next_day_start - timedelta(minutes=1))

                events.append([start.date().isoformat(), start.time().isoformat(timespec='minutes'),
                               event_end.time().isoformat(timespec='minutes'), event.name, event.uid])

                start = next_day_start

    return events


@shared_task
def update_calendars():
    #  Находим все территории для которых задан внешний календарь
    moscow_tz = pytz.timezone('Europe/Moscow')
    today = timezone.now().astimezone(moscow_tz)

    territories = Territory.objects.filter(
        settings__calendar_url__isnull=False,
        settings__calendar_type__isnull=False
    )
    for territory in territories:
        # Удаляем все события внешнего календаря (которые еще не состоялись) для территории
        external_calendar_events = territory.external_calendar_events.filter(
            event_date__gte=today.replace(day=1) - relativedelta(months=1))
        external_calendar_events.delete()

        # Парсим календарь и добавляем события внешнего календаря для территории
        calendar_url = territory.settings.calendar_url
        calendar_type = territory.settings.calendar_type

        events = get_events(
            calendar_url=calendar_url,
            calendar_type=calendar_type
        )
        for event in events:
            ExternalEvent.objects.create(
                time_slots=[{"start": event[1], "end": event[2]}],
                event_date=event[0],
                event_uid=event[4],
                event_name=event[3],
                territory=territory,
            )

    return


def test(request, *args, **kwargs):
    update_calendars()
    return Response(status=200)


def get_tenant_status_info(booking):
    tenant_status_info = {
        1: {
            "title": "Бронирование создано",
            "main_text": f"Ваше бронирование на площадке {booking.territory.site.name}, {booking.territory.name} создано и ожидает подтверждения администратором площадки!",
            "button_text": "Перейти к площадке",
        },
        2: {
            "title": "Бронирование согласовано администратором площадки",
            "main_text": f"Ваше бронирование на площадке {booking.territory.site.name}, {booking.territory.name} создано и ожидает подтверждения администратором площадки!",
            "button_text": "Перейти к площадке",
        },
        3: {
            "title": "Оферта подписана!",
            "main_text": f"Вы приняли акцепт оферты для бронирования на площадке {booking.territory.site.name} в {booking.territory.name}. Поздравляем!",
            "button_text": "Перейти к площадке",
        },
        4: {
            "title": "Бронирование отменено",
            "main_text": f"Сожалеем, но администратор площадки {booking.territory.site.name}, {booking.territory.name} отменил бронирование. Приносим извинения за доставленные неудобства",
            "button_text": "Перейти к площадке",
        },
        5: {
            "title": "Бронирование отменено",
            "main_text": "Мы сожалеем, что вы отменили бронирование. Напишите, пожалуйста, на почту info@bookingin.moscow почему вы отменили бронирование. Мы хотим стать лучше!",
            "button_text": "Перейти к площадке",
        },
        6: {
            "title": "Ваше бронирование успешно завершено!",
            "main_text": f"Администратор площадки {booking.territory.site.name} отметил, что ваше бронирование {booking.territory.name} успешно состоялось. Теперь вы можете оставить отзыв о площадке и поставить оценку. Спасибо, что пользуетесь нашим сервисом!",
            "button_text": "Перейти к площадке",
        },
    }

    return tenant_status_info[booking.status]


def get_landlord_status_info(booking):
    landlord_status_info = {
        1: {
            "title": "Бронирование создано",
            "main_text": f"На вашей площадке новое бронирование! Пользователь {booking.tenant.snp} хочет забронировать площадку {booking.territory.site.name}, {booking.territory.name} в дату {booking.date}. Пожалуйста, согласуйте бронирование или отклоните его в течение 24 часов.",
            "button_text": "Перейти к площадке",
        },
        2: {
            "title": "Бронирование согласовано!",
            "main_text": f"Вы согласовали бронирование {booking.territory.site.name}, {booking.territory.name}. При необходимости свяжитесь с арендатором {booking.tenant.snp} для уточнения деталей.",
            "button_text": "Перейти к площадке",
        },
        3: {
            "title": "Оферта подписана!",
            "main_text": f"Арендатор {booking.tenant.snp} подписал оферту для бронирования {booking.territory.site.name}, {booking.territory.name} в дату {booking.date}. Поздравляем! При необходимости свяжитесь с арендатором для уточнения деталей.",
            "button_text": "Перейти к площадке",
        },
        4: {
            "title": "Бронирование отменено",
            "main_text": f"Вы отменили бронирование {booking.territory.site.name}, {booking.territory.name} в дату {booking.date}. Мы уведомили об этом арендатора.",
            "button_text": "Перейти к площадке",
        },
        5: {
            "title": "Бронирование отменено",
            "main_text": f"Сожалеем, но арендатор {booking.tenant.snp} отменил бронирование {booking.territory.site.name}, {booking.territory.name} в дату {booking.date}. Приносим извинения за доставленные неудобства.",
            "button_text": "Перейти к площадке",
        },
        6: {
            "title": "Бронирование успешно завершено!",
            "main_text": f"Вы отметили, что бронирование {booking.territory.site.name}, {booking.territory.name} в дату {booking.date} успешно состоялось. Теперь арендатор может оставить отзыв о площадке и поставить оценку. Мы уведомили его о такой возможности!",
            "button_text": "Перейти к площадке",
        },
    }
    return landlord_status_info[booking.status]


@shared_task
def notify_users_via_email_about_status(booking_id: str):
    from booking.models import Booking
    try:
        booking = Booking.objects.get(id=booking_id)
        if booking.territory.site.subdomain:
            button_link = f"https://{booking.territory.site.subdomain}.bookingin.moscow"
        else:
            button_link = f"https://bookingin.moscow/sites/{booking.territory.site.id}"
    except Exception as e:
        telegram_message(traceback.format_exc())
        return False

    tenant_status_info = get_tenant_status_info(booking)

    try:
        email = Email()
        email.send_email_with_button(
            receivers=[booking.tenant.email],
            subject="[АртМосфера] Изменения в вашем бронировании на платформе BookingInMoscow",
            greeting=f"Здравствуйте, {booking.tenant.get_greeting_name()}!",
            bottom_text="Если у вас возникнут вопросы, то вы всегда можете обратиться к Администратору платформы, "
                        "написав на почту info@mail.bookingin.moscow.",
            button_link=button_link,
            **tenant_status_info
        )
    except Exception:
        telegram_message(traceback.format_exc())

    landlord_status_info = get_landlord_status_info(booking)

    try:
        email = Email()
        email.send_email_with_button(
            receivers=[booking.territory.site.creator.email],
            subject="[АртМосфера] Информация о бронировании вашего пространства на платформе BookingInMoscow",
            greeting=f"Здравствуйте, {booking.territory.site.creator.get_greeting_name()}!",
            bottom_text="Если у вас возникнут вопросы, то вы всегда можете обратиться к Администратору платформы, "
                        "написав на почту info@mail.bookingin.moscow.",
            button_link=button_link,
            **landlord_status_info
        )
    except Exception:
        telegram_message(traceback.format_exc())

    return True
