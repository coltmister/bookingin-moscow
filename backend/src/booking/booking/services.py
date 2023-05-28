from booking.booking.exceptions import BookingStatusError
from booking.models import Booking



def change_booking_status(user, booking, status):
    if user.is_tenant:
        if status == Booking.BookingStatus.CANCELED:
            if booking.status == Booking.BookingStatus.SUCCEEDED:
                raise BookingStatusError('Нельзя отменить завершенное бронирование')
            if booking.status == Booking.BookingStatus.DECLINED:
                raise BookingStatusError('Данное бронирование уже отменено арендодателем')
        else:
            raise BookingStatusError('Недоступный статус бронирования')

    elif user.is_landlord or user.is_admin:
        if status == Booking.BookingStatus.DECLINED:
            if booking.status == Booking.BookingStatus.SUCCEEDED:
                raise BookingStatusError('Нельзя отменить завершенное бронирование')
            if booking.status == Booking.BookingStatus.CANCELED:
                raise BookingStatusError('Данное бронирование уже отменено')

        elif status == Booking.BookingStatus.SUCCEEDED:
            if booking.status != Booking.BookingStatus.SIGNED:
                raise BookingStatusError('Нельзя завершить бронирование, которое не было подписано')

        elif status == Booking.BookingStatus.AGREED:
            if booking.status != Booking.BookingStatus.PENDING:
                raise BookingStatusError('Нельзя согласовать бронирование, которое не ожидает согласования')

        else:
            raise BookingStatusError('Недоступный статус бронирования')

    booking.status = status
    booking.save()

    return booking
