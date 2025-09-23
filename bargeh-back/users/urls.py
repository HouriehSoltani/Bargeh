from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("auth/signup/student/", views.StudentSignupView.as_view(), name="student_signup"),
    path("auth/login/", views.RoleTokenView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", views.LogoutView.as_view(), name="logout"),
    path("me/", views.MeView.as_view(), name="me"),
    path("profile/", views.UserProfileView.as_view(), name="profile"),
]
