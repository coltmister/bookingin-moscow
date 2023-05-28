import logging

logger = logging.getLogger(__name__)


class TokenGenerationError(Exception):
    def __init__(self, message="Произошла ошибка при генерации токена"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"
