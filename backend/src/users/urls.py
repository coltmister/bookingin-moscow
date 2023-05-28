from django.urls import path

from users.users import UserView, UserDetailView, MyUserView, UserAvatarView, PromoteToAdminView, VerifyUserView, \
    UserActivityStatusView, CompanyDetailView, CompanyLogoView

urlpatterns = [
    path("", UserView.as_view()),
    path("<uuid:user_pk>", UserDetailView.as_view()),
    path("<uuid:user_pk>/promote", PromoteToAdminView.as_view()),
    path("<uuid:user_pk>/verify", VerifyUserView.as_view()),
    path("<uuid:user_pk>/activity-status", UserActivityStatusView.as_view()),

    path("me", MyUserView.as_view()),
    path("avatar", UserAvatarView.as_view()),

    path("<uuid:user_pk>/company", CompanyDetailView.as_view()),
    path("company/avatar", CompanyLogoView.as_view())

]
