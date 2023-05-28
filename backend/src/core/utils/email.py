import email
import email.mime.multipart
import logging
import smtplib
import ssl
from email import encoders
from email.header import Header
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.utils import formataddr

import requests
from celery import shared_task
from jinja2 import Environment, select_autoescape, FileSystemLoader

from core.utils.exceptions import EmailSendError, EmailError

try:
    from settings.settings import EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD
except ImportError:
    EMAIL_HOST = None
    EMAIL_PORT = None
    EMAIL_ADDRESS = None
    EMAIL_PASSWORD = None

logger = logging.getLogger(__name__)


class Email:
    """Отправить email"""

    def __init__(self,
                 email_host=EMAIL_HOST,
                 email_port=EMAIL_PORT,
                 email_address=EMAIL_ADDRESS,
                 email_password=EMAIL_PASSWORD):

        self.email_host = email_host
        self.email_port = email_port
        self.email_address = email_address
        self.email_password = email_password

    def send_email(self,
                   receivers: list[str],
                   subject: str = '',
                   text: str = None,
                   html: str = None,
                   attachments: list[dict] = None,
                   carbon_copy: list[str] = None,
                   blind_carbon_copy: list[str] = None) -> bool:
        """
         Отправить email

        :param receivers: Список получателей
        :param carbon_copy: Список копий
        :param blind_carbon_copy: Список скрытых копий
        :param text: Текстовое представление письма
        :param html: HTML представление письма
        :param attachments: Список вложений
        :param subject: Тема письма

        :return: True - письмо отправлено, False - письмо не отправлено
        """

        all_receivers = []
        message = email.mime.multipart.MIMEMultipart("alternative")
        message["From"] = formataddr((str(Header('Креативные площадки Москвы', 'utf-8')), self.email_address))
        message["Subject"] = subject
        message["To"] = ",".join(receivers)

        all_receivers.extend(receivers)

        if carbon_copy:
            message["CC"] = ','.join(carbon_copy)
            all_receivers.extend(carbon_copy)
        if blind_carbon_copy:
            all_receivers.extend(blind_carbon_copy)

        if not text and not html:
            raise EmailError("Должно быть заполнено одно из полей: text или html")

        if text:
            text_part = MIMEText(text, "plain")
            message.attach(text_part)
        if html:
            html_part = MIMEText(f"{html}", "html")
            message.attach(html_part)

        context = ssl.create_default_context()
        if attachments:
            for attachment in attachments:
                url = attachment.get('url')
                if not url:
                    continue
                temp_doc = requests.get(url, stream=True)
                filetype = temp_doc.headers['Content-Type']
                maintype, subtype = filetype.split('/')
                part = email.mime.base.MIMEBase(maintype, subtype, name=url.split("/")[-1])
                part.set_payload(temp_doc.content)
                email.encoders.encode_base64(part)
                part.add_header('Content-Disposition',
                                f'attachment; filename="{url.split("/")[-1]}"')
                message.attach(part)

        try:
            with smtplib.SMTP_SSL(self.email_host, self.email_port, context=context, timeout=10) as server:
                server.ehlo()
                server.login(self.email_address, self.email_password)
                server.auth_plain()
                server.sendmail(self.email_address, all_receivers, message.as_string())
            return True
        except Exception as e:
            raise EmailSendError(e)

    def send_email_with_button(self,
                               receivers: list[str],
                               subject: str,
                               title: str,
                               greeting: str | None = None,
                               main_text: str | None = None,
                               bottom_text: str | None = None,
                               button_text: str | None = None,
                               button_link: str | None = None,
                               carbon_copy: list[str] = None,
                               blind_carbon_copy: list[str] = None,
                               ) -> bool:
        """
        Отправить email с кнопкой

        :param receivers: Список получателей
        :param subject: Тема письма
        :param title: Заголовок письма
        :param greeting: Приветствие
        :param main_text: Основной текст
        :param bottom_text: Текст внизу письма
        :param button_text: Текст кнопки
        :param button_link: Ссылка кнопки
        :param carbon_copy: Список копий
        :param blind_carbon_copy: Список скрытых копий
        :return: True - письмо отправлено, False - письмо не отправлено
        """
        env = Environment(loader=FileSystemLoader("core"), autoescape=select_autoescape())
        html = env.get_template('utils/email_button.html')
        content = {
            "title": title,
            "greeting": greeting,
            "main_text": main_text,
            "bottom_text": bottom_text,
            "button_text": button_text,
            "button_link": button_link
        }
        html = html.render(**content)
        return self.send_email(
            receivers=receivers,
            carbon_copy=carbon_copy,
            blind_carbon_copy=blind_carbon_copy,
            subject=subject,
            text=main_text,
            html=html)

    def send_email_with_text(self,
                             receivers: list[str],
                             subject: str,
                             title: str,
                             greeting: str | None = None,
                             main_text: str | None = None,
                             bottom_text: str | None = None,
                             text_code: str | None = None,
                             carbon_copy: list[str] = None,
                             blind_carbon_copy: list[str] = None,
                             ) -> bool:
        """
        Отправить email с кнопкой

        :param receivers: Список получателей
        :param subject: Тема письма
        :param title: Заголовок письма
        :param greeting: Приветствие
        :param main_text: Основной текст
        :param bottom_text: Текст внизу письма
        :param text_code: Текст кода
        :param carbon_copy: Список копий
        :param blind_carbon_copy: Список скрытых копий
        :return: True - письмо отправлено, False - письмо не отправлено
        """
        env = Environment(loader=FileSystemLoader("core"), autoescape=select_autoescape())
        html = env.get_template('utils/email_button.html')
        content = {
            "title": title,
            "greeting": greeting,
            "main_text": main_text,
            "bottom_text": bottom_text,
            "text_code": text_code
        }
        html = html.render(**content)

        return self.send_email(
            receivers=receivers,
            carbon_copy=carbon_copy,
            blind_carbon_copy=blind_carbon_copy,
            subject=subject,
            text=main_text,
            html=html)


@shared_task
def send_email(email_data, *args, **kwargs):
    email = Email()

    try:
        email.send_email_with_button(**email_data)
    except EmailError as error:
        logger.info(f"Ошибка при отправке письма {error}")
