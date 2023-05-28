from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from rest_framework.views import APIView

from core.utils.decorators import auth, auth_anon, log_action, tryexcept
from core.utils.http import Response
from site_territory.models import Category, Territory
from site_territory.territory.add_fields.serializers import AddFieldSerializer, AddFieldValueSerializer, \
    WriteAddFieldValueSerializer
from users.models import User


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AddFieldView(APIView):
    category = None

    def dispatch(self, request, *args, **kwargs):
        category_id = kwargs.get('category_id')
        try:
            self.category = Category.objects.get(id=category_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role in [User.RoleType.ADMIN, User.RoleType.LANDLORD]:
            data = self.category.fields.all()
        else:
            return Response(status=403, content="У вас нет прав на просмотр полей")
        result = AddFieldSerializer(data, many=True).data
        return Response(result)

    def post(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role not in [User.RoleType.ADMIN]:
            return Response(status=403, content="У вас нет прав на добавление полей")
        data = request.data
        serializer = AddFieldSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(category=self.category)
        return Response(status=201, content={'id': str(instance.id)})


@method_decorator([tryexcept, auth, log_action], name='dispatch')
class AddFieldViewDetail(APIView):
    category = None

    def dispatch(self, request, *args, **kwargs):
        category_id = kwargs.get('category_id')
        try:
            self.category = Category.objects.get(id=category_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role in [User.RoleType.ADMIN, User.RoleType.LANDLORD]:
            add_field_id = kwargs.get('add_field_id')
            try:
                add_field = self.category.fields.get(id=add_field_id)
            except ObjectDoesNotExist:
                return Response(status=404, content="Объект не найден")
            result = AddFieldSerializer(add_field).data
            return Response(result)
        else:
            return Response(status=403, content="У вас нет прав на просмотр полей")

    def put(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role not in [User.RoleType.ADMIN]:
            return Response(status=403, content="У вас нет прав на редактирование полей")
        add_field_id = kwargs.get('add_field_id')
        try:
            add_field = self.category.fields.get(id=add_field_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        data = request.data
        serializer = AddFieldSerializer(instance=add_field, data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role not in [User.RoleType.ADMIN]:
            return Response(status=403, content="У вас нет прав на удаление полей")
        add_field_id = kwargs.get('add_field_id')
        try:
            add_field = self.category.fields.get(id=add_field_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        add_field.delete()
        return Response(status=204)


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class AddFieldValueView(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        try:
            self.territory = Territory.objects.get(id=territory_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        values = self.territory.add_fields_values.all()
        result = AddFieldValueSerializer(values, many=True).data
        return Response(result)

    def post(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role not in [User.RoleType.ADMIN] and user != self.territory.site.creator:
            return Response(status=403, content="У вас нет прав на добавление значений полей")
        data = request.data
        serializer = WriteAddFieldValueSerializer(data=data, context={'territory': self.territory})
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(territory=self.territory)
        return Response(status=201, content={'id': str(instance.id)})


@method_decorator([tryexcept, auth_anon, log_action], name='dispatch')
class AddFieldValueViewDetail(APIView):
    territory = None

    def dispatch(self, request, *args, **kwargs):
        territory_id = kwargs.get('territory_id')
        try:
            self.territory = Territory.objects.get(id=territory_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        add_field_value_id = kwargs.get('add_field_value_id')
        try:
            add_field_value = self.territory.add_fields_values.get(id=add_field_value_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        result = AddFieldValueSerializer(add_field_value).data
        return Response(result)

    def put(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role not in [User.RoleType.ADMIN] and user != self.territory.site.creator:
            return Response(status=403, content="У вас нет прав на редактирование значений полей")
        add_field_value_id = kwargs.get('add_field_value_id')
        try:
            add_field_value = self.territory.add_fields_values.get(id=add_field_value_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        data = request.data
        serializer = WriteAddFieldValueSerializer(instance=add_field_value, data=data,
                                                  context={'territory': self.territory})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=204)

    def delete(self, request, *args, **kwargs):
        user = kwargs.get('user')
        if user.role not in [User.RoleType.ADMIN] and user != self.territory.site.creator:
            return Response(status=403, content="У вас нет прав на удаление значений полей")
        add_field_value_id = kwargs.get('add_field_value_id')
        try:
            add_field_value = self.territory.add_fields_values.get(id=add_field_value_id)
        except ObjectDoesNotExist:
            return Response(status=404, content="Объект не найден")
        add_field_value.delete()
        return Response(status=204)
