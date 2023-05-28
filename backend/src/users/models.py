import datetime
import io
import traceback
import uuid

import requests
from django.core.cache import cache
from django.db import models
from docx.shared import Mm
from docxtpl import DocxTemplate, InlineImage

from core.models import AbstractBase
from core.utils.exceptions import S3ConnectionError, S3DownloadError, S3UploadError
from core.utils.files import S3Wrapper
from core.utils.notification import telegram_message
from settings.settings import S3_DOCS_BUCKET, S3_SERVER, S3_USER_PHOTO_BUCKET


class User(AbstractBase):
    class RoleType(models.IntegerChoices):
        TENANT = 1, 'Арендатор'
        LANDLORD = 2, 'Арендодатель'
        ADMIN = 3, 'Администратор'

    id = models.UUIDField(primary_key=True, verbose_name="ID Пользователя")
    role = models.IntegerField(choices=RoleType.choices, default=RoleType.TENANT)

    name = models.CharField(max_length=255, verbose_name="Имя пользователя")
    surname = models.CharField(max_length=255, verbose_name="Фамилия пользователя")
    patronymic = models.CharField(max_length=255, verbose_name="Отчество пользователя", null=True, blank=True)
    email = models.EmailField(verbose_name="Адрес электронной почты пользователя", unique=True)
    phone = models.CharField(max_length=15, verbose_name="Номер телефона пользователя", null=True, blank=True)
    date_of_birth = models.DateField(verbose_name="Дата рождения пользователя", null=True, blank=True)
    position = models.CharField(max_length=255, verbose_name="Должность", null=True, blank=True)

    rating = models.FloatField(default=None, verbose_name="Рейтинг пользователя", null=True, blank=True)
    avatar = models.UUIDField(null=True, blank=True, verbose_name="ID Аватара пользователя")
    avatar_thumbnail = models.UUIDField(null=True, blank=True, verbose_name="ID Миниатюры аватара пользователя")

    is_active = models.BooleanField(default=True, verbose_name="Пользователь активен?")
    is_verified = models.BooleanField(default=False, verbose_name="Пользователь верифицирован?")

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.id}. 🌝  {self.surname} {self.name} {self.patronymic} {self.email} {self.is_active}"

    @property
    def snp(self):
        user_patronymic = self.patronymic or ""
        return f'{self.surname} {self.name} {user_patronymic}'.strip()

    def get_greeting_name(self):
        greeting_name = f"{self.name} {self.patronymic}" if self.patronymic else f"{self.name}"
        return greeting_name

    @property
    def is_admin(self):
        return self.role == self.RoleType.ADMIN

    @property
    def is_tenant(self):
        return self.role == self.RoleType.TENANT

    @property
    def is_landlord(self):
        return self.role == self.RoleType.LANDLORD

    @property
    def avatar_url(self):
        if not self.avatar:
            return None
        url = f"https://{S3_USER_PHOTO_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.avatar}.jpg"
        return url

    @property
    def avatar_thumbnail_url(self):
        if not self.avatar_thumbnail:
            return None
        url = f"https://{S3_USER_PHOTO_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.avatar}.jpg"
        return url


class Company(AbstractBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Название компании", null=True, blank=True)
    address = models.CharField(max_length=255, verbose_name="Адрес компании", null=True, blank=True)
    tax_number = models.CharField(max_length=255, verbose_name="ИНН", null=True, blank=True)
    logo = models.UUIDField(null=True, blank=True, verbose_name="ID Логотипа компании")
    owner = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="Владелец", related_name="company")
    offer_filename = models.CharField(max_length=255, verbose_name="UUID файла с офертой", null=True, blank=True)

    class Meta:
        verbose_name = "Компания"
        verbose_name_plural = "Компании"
        ordering = ['-created_at']

    @property
    def logo_url(self):
        if not self.logo:
            return None
        url = f"https://{S3_USER_PHOTO_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.logo}.jpg"
        return url

    @property
    def offer_url(self):
        if not self.offer_filename:
            return None
        url = f"https://{S3_DOCS_BUCKET}.{S3_SERVER.replace('https://', '')}/{self.offer_filename}.docx"
        return url

    def save(self, *args, **kwargs):
        try:
            cache.delete(f"{self.id}_coords")
        except Exception:
            pass
        docx_tpl = DocxTemplate("Offer.docx")
        current_date = f"{datetime.datetime.now().strftime('%d.%m.%Y')}г."
        logo_url = self.logo_url
        try:
            company_logo = requests.get(logo_url).content
            file_io = io.BytesIO(company_logo)
        except Exception:
            company_logo = None
        if company_logo:
            company_logo = InlineImage(docx_tpl, file_io, height=Mm(14.2))
        else:
            company_logo = ''

        context = {
            'company_name': self.name or '',
            'main_url': 'https://bookingin.moscow/',
            'offer_url': S3_SERVER,
            'tax_number': self.tax_number or '',
            'company_address': self.address or '',
            'phone': self.owner.phone or '',
            'current_date': current_date,
            'company_logo': company_logo,
            'position': self.owner.position or '',
            'user_snp': self.owner.snp or '',

        }

        docx_tpl.render(context)
        file_content = io.BytesIO()
        docx_tpl.save(file_content)
        file_content.seek(0)
        uuid_file_name = uuid.uuid4()
        file_name = f"{uuid_file_name}.docx"
        try:
            s3 = S3Wrapper(bucket_name=S3_DOCS_BUCKET)
            s3.upload_file(file_name, file_content)
        except (S3UploadError, S3DownloadError, S3ConnectionError) as error:
            telegram_message(traceback.format_exc())
        self.offer_filename = uuid_file_name
        super(Company, self).save(*args, **kwargs)
