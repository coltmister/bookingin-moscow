import hashlib
import json
import traceback
from datetime import timedelta

import requests
from django.utils import timezone

from booking.models import Booking, ConfirmationCode
from booking.offer.exceptions import CallError
from core.utils.email import Email
from core.utils.exceptions import EmailError
from core.utils.notification import telegram_message
from settings.settings import CALL_TOKEN, CALL_URL
from users.models import User


def compute_md5(input_string):
    md5_hash = hashlib.md5()
    md5_hash.update(input_string.encode('utf-8'))
    return md5_hash.hexdigest()


def init_sign_offer_via_call(booking: Booking) -> str:
    if booking.status != Booking.BookingStatus.AGREED:
        raise CallError("Бронирование не согласовано, невозможно подписать оферту")

    confirmation = ConfirmationCode.objects.create(
        type=ConfirmationCode.ConfirmationCodeType.CONFIRMATION_VIA_CALL,
        code=None,
        is_used=False,
        use_until=timezone.now() + timedelta(minutes=10),
        booking=booking
    )

    code = init_call(booking.tenant.phone, str(confirmation.id))

    confirmation.code = code
    confirmation.save()

    return str(confirmation.id)


def init_call(recipient: str, call_id: str) -> str:
    payload = json.dumps({
        "recipient": recipient,
        "id": compute_md5(call_id),
        "tags": [
            "Акцепт оферты"
        ],
        "validate": False,
        "limit": {
            "count": 3,
            "period": 600
        }
    })
    headers = {
        'X-Token': CALL_TOKEN,
        'Content-Type': 'application/json',
    }
    response = requests.request("POST", CALL_URL, headers=headers, data=payload)

    try:
        response_json = response.json()
    except Exception as e:
        telegram_message(f"Ошибка при совершении звонка: {traceback.format_exc()}")
        raise CallError("Ошибка при совершении звонка")

    if response.status_code == 200:
        code = response_json['result']['code']
    else:
        telegram_message(f"Ошибка при совершении звонка: {response_json}")
        raise CallError(
            "Непредвиденная ошибка при совершении звонка. Повторите попытку позже или воспользуйтесь другим способом подписания оферты.")

    return code


def init_sign_offer_via_email(booking: Booking) -> str:
    if booking.status != Booking.BookingStatus.AGREED:
        raise EmailError("Бронирование не согласовано, невозможно подписать оферту")

    confirmation = ConfirmationCode.objects.create(
        type=ConfirmationCode.ConfirmationCodeType.CONFIRMATION_VIA_EMAIL,
        code=None,
        is_used=False,
        use_until=timezone.now() + timedelta(minutes=10),
        booking=booking
    )

    code = ConfirmationCode.generate_code()
    init_email(booking.tenant, code)

    confirmation.code = code
    confirmation.save()

    return str(confirmation.id)


def init_email(user: User, code: str):
    email = Email()
    email.send_email_with_text(
        receivers=[user.email],
        subject="Подтверждение оферты",
        title="Подтверждение оферты",
        greeting=f"Здравствуйте, {user.get_greeting_name()}!",
        main_text="Для подписания оферты введите код акцепта в поле ввода на странице.",
        bottom_text="С уважением, команда АртМосфера.",
        text_code=f"Ваш код акцепта оферты: {code}"
    )

    return
