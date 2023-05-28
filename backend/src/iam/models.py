from django.db import models

from core.models import AbstractBase


class LogoutUser(AbstractBase):
    """Таблица пользователей, которых необходимо вывести из системы"""
    REFRESH_TOKEN = 0
    LOGOUT = 1
    LOGOUT_TYPE = [
        (REFRESH_TOKEN, 'Обновление токена'),
        (LOGOUT, 'Выход из системы'),
    ]
    id = models.AutoField(primary_key=True, verbose_name="ID")
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, verbose_name="Пользователь")
    session_id = models.UUIDField(verbose_name="ID сессии", null=True, blank=True)
    iat_before = models.DateTimeField(verbose_name="Время выхода из системы")
    logout_type = models.IntegerField(choices=LOGOUT_TYPE, verbose_name="Тип выхода из системы", default=REFRESH_TOKEN)

    class Meta:
        verbose_name = "Logout пользователь"
        verbose_name_plural = "Logout пользователи"
        indexes = [
            models.Index(fields=['user', 'iat_before', 'logout_type']),
            models.Index(fields=['user', 'session_id']),
        ]

    def __str__(self):
        return f"{self.id} {self.user.id} {self.session_id} {self.iat_before} {self.logout_type}"
