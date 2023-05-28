from django.utils import timezone
from rest_framework import serializers

from booking.models import ConfirmationCode, Booking


class VerifySignOfferCodeSerializer(serializers.Serializer):
    confirmation = serializers.PrimaryKeyRelatedField(queryset=ConfirmationCode.objects.all())
    code = serializers.CharField(max_length=4)

    def validate(self, attrs):
        # TODO продумать механизм защиты от абъюза
        confirmation = attrs['confirmation']
        code = attrs['code']

        if confirmation.booking.status != Booking.BookingStatus.AGREED:
            raise serializers.ValidationError("Бронирование не согласовано, невозможно подписать оферту")

        if confirmation.attempt_count >= ConfirmationCode.MAX_ATTEMPTS:
            raise serializers.ValidationError(
                "Превышено максимальное количество попыток, запросите верификацию повторно")

        if confirmation.is_used:
            raise serializers.ValidationError("Код уже использован")

        if confirmation.use_until < timezone.now():
            raise serializers.ValidationError("Код просрочен")

        if confirmation.code != code:
            confirmation.attempt_count += 1
            confirmation.save()
            raise serializers.ValidationError("Неверный код")

        return attrs

    def save(self, **kwargs):
        confirmation = self.validated_data['confirmation']
        confirmation.is_used = True
        confirmation.save()

        confirmation.booking.is_offer_signed = True
        confirmation.booking.status = Booking.BookingStatus.SIGNED
        confirmation.booking.save()

        return confirmation.booking
