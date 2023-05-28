import django_filters

from users.models import User


class UserFilter(django_filters.FilterSet):
    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    class Meta:
        model = User
        fields = {
            'role': ['exact'],
            'is_active': ['exact'],
            'is_verified': ['exact'],
            'rating': ['gte', 'lte'],
        }
