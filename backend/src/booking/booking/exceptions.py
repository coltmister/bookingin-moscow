class BookingStatusError(Exception):
    def __init__(self, message="Произошла ошибка при попытке изменения статуса бронирвоания"):
        self.message = message
        super().__init__(self.message)

    def __str__(self):
        return f"{self.message}"
