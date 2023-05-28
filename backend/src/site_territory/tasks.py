import traceback

from celery import shared_task

from core.utils.email import Email
from core.utils.notification import telegram_message


@shared_task
def send_site_confirmation_email(site_id: str):
    from site_territory.models import Site
    try:
        site = Site.objects.get(id=site_id)
        if site.subdomain:
            button_link = f"https://{site.subdomain}.bookingin.moscow"
        else:
            button_link = f"https://bookingin.moscow/sites/{site.id}"
        email = Email()
        email.send_email_with_button(
            receivers=[site.creator.email],
            subject="[АртМосфера] Подтверждение вашей площадки на платформе BookingInMoscow",
            title=f"Подтверждение площадки {site.name}",
            greeting=f"Здравствуйте, {site.creator.get_greeting_name()}!",
            main_text="Ваша площадка была одобрена Администратором платформы. "
                      "Теперь вы сможете управлять своими бронированиями и принимать новые от пользователей. \n\n"
                      "Попробуйте все преимущества нашей платформы и давайте сделаем наш город еще лучше!",
            bottom_text="ё",
            button_text="Перейти к своей площадке",
            button_link=button_link
        )
    except Exception:
        telegram_message(traceback.format_exc())
        return False
    return True


@shared_task
def send_new_feedback_email(feedback_id: str):
    from site_territory.models import SiteFeedback
    try:
        feedback = SiteFeedback.objects.get(id=feedback_id)
        email = Email()
        email.send_email_with_button(
            receivers=[feedback.site.creator.email],
            subject="[АртМосфера] Новый отзыв о вашей площадке на платформе BookingInMoscow",
            title=f"Новый отзыв о площадке {feedback.site.name}",
            greeting=f"Здравствуйте, {feedback.site.creator.get_greeting_name()}!",
            main_text="На вашей площадке оставили отзыв. \n\n"
                      "Не забудьте оставить комментарий и поблагодарить человека об отзыве!",
            bottom_text="Если у вас возникнут вопросы, то вы всегда можете обратиться к Администратору платформы, "
                        "написав на почту info@mail.bookingin.moscow.",
            button_text="Перейти на платформу",
            button_link=f"https://bookingin.moscow"
        )
    except Exception:
        telegram_message(traceback.format_exc())
        return False


