import uuid

from django.db import models


class AbstractBase(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создано")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлено")

    class Meta:
        abstract = True


class Draft(AbstractBase):
    """Таблица черновиков."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Черновика")
    user = models.ForeignKey('users.User', verbose_name="Пользователь", on_delete=models.CASCADE)
    key = models.TextField(verbose_name="Ключ")
    expiration_date = models.DateTimeField(verbose_name="Время истечения срока действия черновика")
    data = models.JSONField(verbose_name="Данные черновика")

    class Meta:
        verbose_name = "Черновик"
        verbose_name_plural = "Черновики"

    def __str__(self):
        return f"{self.id} {self.key} {self.user}. Действует до: {self.expiration_date}"


class Metric(AbstractBase):
    """Таблица метрик."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, verbose_name="ID Метрики")
    user_name = models.CharField(max_length=255, verbose_name="Имя пользователя", null=True, blank=True)
    method = models.CharField(max_length=255, verbose_name="Метод")
    request_path = models.CharField(max_length=255, verbose_name="Путь")
    status_code = models.IntegerField(verbose_name="Код ответа")
    remote_address = models.CharField(max_length=255, verbose_name="IP адрес")
    taken_time = models.FloatField(verbose_name="Время выполнения запроса")

    class Meta:
        verbose_name = "Метрика"
        verbose_name_plural = "Метрики"

    def __str__(self):
        return f"{self.id} {self.created_at}"
