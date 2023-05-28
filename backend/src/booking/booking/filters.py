import django_filters

from booking.models import Booking


class BookingFilter(django_filters.FilterSet):
    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    class Meta:
        model = Booking
        fields = {
            'status': ['exact'],
            'date': ['gte', 'lte', 'exact'],
            'is_offer_signed': ['exact'],
        }