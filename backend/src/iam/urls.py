from django.urls import path

from iam import sessions, login

urlpatterns = [
    path('users/<uuid:user_uuid>/logout-user/', sessions.LogoutUserView.as_view()),
    path('users/logout-user/', sessions.LogoutUserView.as_view()),
    path('auth/obtain-tokens/', login.ObtainTokensView.as_view()),
    path('auth/refresh-token/', login.RefreshTokenView.as_view()),
    path('auth/logout/', login.logout),
    path('auth/login/', login.login),
    path('auth/login-page/', login.login_page),
]
