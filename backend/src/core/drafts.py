from django.utils import timezone
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from core.serializers import *
from core.utils.decorators import auth, tryexcept, log_action
from core.utils.http import Response


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class DraftView(APIView):
    """Добавить/просмотреть черновик."""

    def get(self, request, *args, **kwargs):
        user = kwargs.get('user')
        key = request.GET.get('key')
        if not key:
            return Response(status=200, content={})

        try:
            draft = Draft.objects.get(user=user, key=key)
        except ObjectDoesNotExist:
            return Response(status=200, content={})

        if draft.expiration_date <= timezone.now():
            return Response(status=200, content={})

        serializer = DraftSerializer(instance=draft)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        user = kwargs.get('user')
        serializer = DraftSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        is_new = serializer.save(user=user)
        status = 201 if is_new else 204
        return Response(status=status)
