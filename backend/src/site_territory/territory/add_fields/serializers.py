from rest_framework import serializers

from core.utils.serializers import AbstractModelSerializer
from site_territory.models import AddField, AddFieldValue


class AddFieldSerializer(AbstractModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')

    class Meta:
        model = AddField
        fields = ['id', 'name', 'type', 'choices']


class AddFieldValueSerializer(AbstractModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    add_field = AddFieldSerializer(read_only=True)

    class Meta:
        model = AddFieldValue
        fields = ['id', 'add_field', 'value']


class WriteAddFieldValueSerializer(AbstractModelSerializer):
    id = serializers.UUIDField(read_only=True, format='hex_verbose')
    add_field = serializers.PrimaryKeyRelatedField(queryset=AddField.objects.all())

    def validate(self, data):
        add_field = data.get('add_field')
        choices = add_field.choices
        if choices:
            if data.get('value') not in choices:
                raise serializers.ValidationError("Значение не входит в список допустимых значений")
        if add_field.type == AddField.Type.BOOL:
            if data.get('value') not in [True, False]:
                raise serializers.ValidationError("Значение должно быть true или false")
        if add_field.type == AddField.Type.INT:
            try:
                int(data.get('value'))
            except ValueError:
                raise serializers.ValidationError("Значение должно быть целым числом")
        territory_category = self.context.get('territory').category
        if add_field not in territory_category.fields.all():
            raise serializers.ValidationError("Поле не принадлежит категории")
        current_instance = self.instance
        if current_instance:
            if current_instance.add_field != add_field:
                raise serializers.ValidationError("Нельзя изменить поле")
        return data

    class Meta:
        model = AddFieldValue
        fields = ['id', 'add_field', 'value']
