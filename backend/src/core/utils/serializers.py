from rest_framework import serializers


class ExpandFieldsMixin:
    def __init__(self, *args, **kwargs):
        # По умолчанию все поля выводятся в раскрытом виде
        self.expanded_fields = kwargs.pop('expanded_fields', '__all__')
        self.folded_fields = kwargs.pop('folded_fields', [])
        super().__init__(*args, **kwargs)

        if self.expanded_fields is None:
            self.expanded_fields = '__all__'
        if self.folded_fields is None:
            self.folded_fields = []

        if self.folded_fields == '__all__':
            fields_to_fold = self.fields.keys()
        elif self.folded_fields:
            fields_to_fold = self.folded_fields
        else:
            if self.expanded_fields == '__all__':
                fields_to_fold = []
            else:
                fields_to_fold = [field_name for field_name in self.fields.keys() if
                                  field_name not in self.expanded_fields]

        for field_name in fields_to_fold:
            field = self.fields[field_name]
            if isinstance(field, serializers.ListSerializer):
                self.fields[field_name] = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
            elif isinstance(field, serializers.BaseSerializer):
                self.fields[field_name] = serializers.PrimaryKeyRelatedField(read_only=True)


class AbstractModelSerializer(ExpandFieldsMixin, serializers.ModelSerializer):

    def __init__(self, *args, **kwargs):
        self.included_fields = kwargs.pop('included_fields', None)
        self.excluded_fields = kwargs.pop('excluded_fields', None)
        super().__init__(*args, **kwargs)

        if self.included_fields is not None:
            allowed = set(self.included_fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        elif self.excluded_fields is not None:
            for field_name in self.excluded_fields:
                self.fields.pop(field_name)
