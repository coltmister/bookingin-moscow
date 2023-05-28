from django.contrib import admin

from core.admin import AbstractAdmin
from users.models import User, Company


# Register your models here.
class UserAdmin(AbstractAdmin):
    list_display = (
        'id', 'name', 'surname', 'patronymic', 'email', 'phone', 'role', 'created_at', 'updated_at',
        'is_active')
    readonly_fields = ('id', 'created_at', 'updated_at')
    search_fields = ['id', 'phone', 'email']


admin.site.register(User, UserAdmin)


class CompanyAdmin(AbstractAdmin):
    list_display = (
        'id', 'name', 'address', 'logo', 'owner', 'created_at', 'updated_at')
    readonly_fields = ('id', 'created_at', 'updated_at')


admin.site.register(Company, CompanyAdmin)
