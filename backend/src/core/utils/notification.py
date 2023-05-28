import json
import logging

import requests
from celery import shared_task

from settings.settings import TELEGRAM_BOT_TOKEN, DEBUG_CHAT_ID

logger = logging.getLogger(__name__)


@shared_task
def telegram_message(info: str,
                     chat_id: str = None,
                     disable_notification: bool = False,
                     parse_mode: str = None) -> None:
    """Функция присылает сообщение в Telegram."""
    if chat_id is None:
        chat_id = DEBUG_CHAT_ID

    logger.info(
        f"[DATA_SEND_TO_TELEGRAM] {info}. [CHAT_ID] {chat_id} [DISABLE_NOTIFICATION] {disable_notification} [PARSE_MODE] {parse_mode}")

    headers = {'Content-Type': 'application/json'}
    data = {
        "chat_id": chat_id,
        "disable_notification": disable_notification,
    }
    if parse_mode:
        data['parse_mode'] = parse_mode

    if len(info) > 4096:
        for x in range(0, len(info), 4096):
            data['text'] = info[x:x + 4096]
            requests.post(
                f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage', headers=headers,
                data=json.dumps(data, ensure_ascii=False).encode('utf-8'), timeout=3)
    else:
        data['text'] = info
        requests.post(
            f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage', headers=headers,
            data=json.dumps(data, ensure_ascii=False).encode('utf-8'), timeout=3)
    return None
