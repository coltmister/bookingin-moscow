from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin

from core.admin import AbstractAdmin
from .models import AddField, AddFieldValue, AddService, Category, Site, SiteFeedback, SiteFile, SitePhoto, Territory, \
    TerritoryFile, \
    TerritoryPhoto, TerritorySettings


# Register your models here.


class CategoryAdmin(AbstractAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    list_per_page = 25


admin.site.register(Category, CategoryAdmin)


class AddFieldAdmin(AbstractAdmin):
    list_display = ('id', 'name', 'category', 'created_at', 'updated_at')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    list_per_page = 25


admin.site.register(AddField, AddFieldAdmin)


class AddFieldValueAdmin(AbstractAdmin):
    list_display = ('id', 'add_field', 'territory', 'value', 'created_at', 'updated_at')
    list_display_links = ('id', 'value')
    search_fields = ('value',)
    list_per_page = 25


admin.site.register(AddFieldValue, AddFieldValueAdmin)


class SiteAdmin(GISModelAdmin):
    list_display = ('id', 'name', 'address', 'rating', 'created_at', 'updated_at')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    list_per_page = 25


admin.site.register(Site, SiteAdmin)


class TerritoryAdmin(AbstractAdmin):
    list_display = ('id', 'name', 'category', 'site', 'created_at', 'updated_at')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    list_per_page = 25


admin.site.register(Territory, TerritoryAdmin)


class TerritorySettingsAdmin(AbstractAdmin):
    list_display = (
        'id', 'territory', 'duration', 'max_slots', 'external_name', 'calendar_url', 'booking_calendar_url',
        'calendar_type', 'created_at',
        'updated_at')
    search_fields = ('territory__name',)
    list_per_page = 25
    readonly_fields = ['booking_calendar_url', 'created_at', 'updated_at']


admin.site.register(TerritorySettings, TerritorySettingsAdmin)


class SitePhotoAdmin(AbstractAdmin):
    list_display = ('id', 'site', 'file_name', 'created_at', 'updated_at')
    list_display_links = ('id', 'file_name')
    search_fields = ('file_name',)
    list_per_page = 25


admin.site.register(SitePhoto, SitePhotoAdmin)


class SiteFileAdmin(AbstractAdmin):
    list_display = ('id', 'site', 'file_name', 'created_at', 'updated_at')
    list_display_links = ('id', 'file_name')
    search_fields = ('file_name',)
    list_per_page = 25


admin.site.register(SiteFile, SiteFileAdmin)


class TerritoryPhotoAdmin(AbstractAdmin):
    list_display = ('id', 'territory', 'file_name', 'created_at', 'updated_at')
    list_display_links = ('id', 'file_name')
    search_fields = ('file_name',)
    list_per_page = 25


admin.site.register(TerritoryPhoto, TerritoryPhotoAdmin)


class TerritoryFileAdmin(AbstractAdmin):
    list_display = ('id', 'territory', 'file_name', 'created_at', 'updated_at')
    list_display_links = ('id', 'file_name')
    search_fields = ('file_name',)
    list_per_page = 25


admin.site.register(TerritoryFile, TerritoryFileAdmin)


class AddServiceAdmin(AbstractAdmin):
    list_display = ('id', 'name', 'type', 'created_at', 'updated_at')
    list_display_links = ('id', 'name')
    search_fields = ('name',)
    list_per_page = 25


admin.site.register(AddService, AddServiceAdmin)


class SiteFeedbackAdmin(AbstractAdmin):
    list_display = ('id', 'site', 'tenant', 'rating', 'text', 'created_at', 'updated_at')
    list_display_links = ('id', 'site')
    search_fields = ('site__name', 'tenant__username')
    list_per_page = 25


admin.site.register(SiteFeedback, SiteFeedbackAdmin)
