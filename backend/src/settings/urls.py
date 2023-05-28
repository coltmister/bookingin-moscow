from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve

from settings import settings

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/v1/iam/', include('iam.urls')),
    path('api/v1/sites/', include('site_territory.urls')),
    path('api/v1/booking/', include('booking.urls')),
    path('api/v1/users/', include('users.urls')),

    re_path(r'^api/static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]
