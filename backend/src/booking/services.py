import io
import logging
import traceback
import uuid
from datetime import datetime, time

import requests
from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from ics import Calendar, Event

from core.utils.exceptions import S3UploadError, S3DownloadError, S3ConnectionError
from core.utils.files import S3Wrapper
from core.utils.notification import telegram_message
from settings.settings import S3_CALENDARS_BUCKET

logger = logging.getLogger(__name__)


def add_event(booking, calendar):
    event_times = booking.time_slots
    # Current date
    booking_date = booking.date

    # Loop through event times
    for index, item in enumerate(event_times):
        hour, minute = map(int, item['start'].split(':'))
        start_time = timezone.make_aware(datetime.combine(booking_date, time(hour=hour, minute=minute)),
                                         timezone=timezone.get_current_timezone())

        hour, minute = map(int, item['end'].split(':'))
        end_time = timezone.make_aware(datetime.combine(booking_date, time(hour=hour, minute=minute)),
                                       timezone=timezone.get_current_timezone())

        # Create an event
        event = Event()
        event.name = f"Бронирование '{booking.territory.name}' [{booking.get_status_display()}]"
        event.description = f"ФИО арендатора: {booking.tenant.snp}.\n" \
                            f"Телефон арендатора: +{booking.tenant.phone} \n" \
                            f"Email арендатора: {booking.tenant.email} \n"
        event.location = booking.territory.site.address
        event.begin = start_time
        event.end = end_time
        event.uid = f"{booking.id}_{index}"
        # Add the event to the calendar
        calendar.events.add(event)


def update_event(events, uid_list, new_name=None, new_description=None, new_begin=None, new_end=None):
    # Find event by UID
    for event in events:
        if event.uid in uid_list:
            if event is not None:
                # Update properties
                if new_name is not None:
                    event.name = new_name
                if new_description is not None:
                    event.description = new_description
                if new_begin is not None:
                    event.begin = new_begin
                if new_end is not None:
                    event.end = new_end


def create_booking_calendar(booking):
    calendar = Calendar()
    booking_calendar_uuid = uuid.uuid4()

    add_event(booking, calendar)

    file_content = io.BytesIO()
    file_content.write(str(calendar).encode())  # encode calendar as bytes
    file_content.seek(0)  # rewind file pointer back to the start
    file_name = f"{booking_calendar_uuid}.ics"

    try:
        s3 = S3Wrapper(bucket_name=S3_CALENDARS_BUCKET)
        s3.upload_file(file_name, file_content)
    except (S3UploadError, S3DownloadError, S3ConnectionError):
        telegram_message(traceback.format_exc())
        return None

    booking.territory.settings.booking_calendar = booking_calendar_uuid
    booking.territory.settings.save()
    return booking


@shared_task
def change_event_in_booking_calendar(booking_id):
    from booking.models import Booking
    try:
        booking = Booking.objects.get(id=booking_id)
    except ObjectDoesNotExist:
        logger.error(f"Бронирования {booking_id} не существует")
        return False
    """"Изменение события в календаре бронирования"""
    booking_calendar_uuid = booking.territory.settings.booking_calendar
    if booking_calendar_uuid is None:
        create_booking_calendar(booking)
    else:
        calendar_url = booking.territory.settings.booking_calendar_url
        response = requests.get(calendar_url)
        response.raise_for_status()
        calendar_data = response.text
        calendar = Calendar(calendar_data)
        events = calendar.events
        uid_list = [f"{booking.id}_{index}" for index in range(len(booking.time_slots))]
        update_event(events, uid_list,
                     new_name=f"Бронирование '{booking.territory.name}' [{booking.get_status_display()}]")

        file_content = io.BytesIO()
        file_content.write(str(calendar).encode())
        file_content.seek(0)
        file_name = f"{booking_calendar_uuid}.ics"
        try:
            s3 = S3Wrapper(bucket_name=S3_CALENDARS_BUCKET)
            s3.upload_file(file_name, file_content)
        except (S3UploadError, S3DownloadError, S3ConnectionError):
            telegram_message(traceback.format_exc())
            logger.error(traceback.format_exc())
            return False

        return True


@shared_task
def add_event_to_booking_calendar(booking_id):
    from booking.models import Booking
    try:
        booking = Booking.objects.get(id=booking_id)
    except ObjectDoesNotExist:
        logger.error(f"Бронирования {booking_id} не существует")
        return False

    """Добавление нового события в календарь бронирования"""
    booking_calendar_uuid = booking.territory.settings.booking_calendar
    if booking_calendar_uuid is None:
        create_booking_calendar(booking)
    else:
        calendar_url = booking.territory.settings.booking_calendar_url
        response = requests.get(calendar_url)
        response.raise_for_status()
        calendar_data = response.text
        calendar = Calendar(calendar_data)

        # Добавляю событие в календарь
        add_event(booking, calendar)

        file_content = io.BytesIO()
        file_content.write(str(calendar).encode())
        file_content.seek(0)
        file_name = f"{booking_calendar_uuid}.ics"
        try:
            s3 = S3Wrapper(bucket_name=S3_CALENDARS_BUCKET)
            s3.upload_file(file_name, file_content)
        except (S3UploadError, S3DownloadError, S3ConnectionError):
            telegram_message(traceback.format_exc())
            logger.error(traceback.format_exc())
            return None

        return True
