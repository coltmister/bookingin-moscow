from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from booking.models import Booking, ConfirmationCode
from booking.offer.exceptions import CallError
from booking.offer.serializers import VerifySignOfferCodeSerializer
from booking.offer.services import init_sign_offer_via_call, init_sign_offer_via_email
from core.utils.decorators import tryexcept, auth, log_action
from core.utils.exceptions import EmailError
from core.utils.http import Response


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class SignOfferView(APIView):
    booking = None
    user = None

    def dispatch(self, request, *args, **kwargs):
        self.user = kwargs.get('user')
        if not self.user.is_tenant:
            return Response(status=403, content="Недостаточно прав на совершение данной операции")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """Отправить запрос на звонок"""
        confirmation_type = request.query_params.get('type', ConfirmationCode.ConfirmationCodeType.CONFIRMATION_VIA_CALL)
        try:
            confirmation_type = int(confirmation_type)
        except ValueError:
            confirmation_type = ConfirmationCode.ConfirmationCodeType.CONFIRMATION_VIA_CALL

        try:
            booking = Booking.objects.get(
                id=kwargs.get('booking_id'),
                tenant=self.user
            )
        except ObjectDoesNotExist:
            return Response(status=404, content={'message': 'Бронирование не найдено'})

        if confirmation_type == ConfirmationCode.ConfirmationCodeType.CONFIRMATION_VIA_CALL:
            try:
                confirmation_id = init_sign_offer_via_call(booking)
            except CallError as e:
                return Response(status=400, content={'message': str(e)})
        else:
            try:
                confirmation_id = init_sign_offer_via_email(booking)
            except EmailError as e:
                return Response(status=400, content={'message': str(e)})

        return Response(status=200, content={'id': confirmation_id, 'message': 'Код подтверждения отправлен'})

    def post(self, request, confirmation_id, *args, **kwargs):
        """Отправить верификационный код"""
        request.data['confirmation'] = confirmation_id
        serializer = VerifySignOfferCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()

        return Response(status=200, content={'message': 'Оферта подписана', 'booking': str(booking.id)})

# Отдельная апиха на получение оферты
