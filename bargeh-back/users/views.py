from rest_framework import status, generics, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenBlacklistView, TokenObtainPairView
from django.contrib.auth import get_user_model
from .tokens import RoleTokenObtainPairSerializer
from .serializers import (
    StudentSignupSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
)

User = get_user_model()


class StudentSignupView(generics.CreateAPIView):
    """Student-only signup endpoint"""
    serializer_class = StudentSignupSerializer
    permission_classes = [AllowAny]


class RoleTokenView(TokenObtainPairView):
    """Login view with role in token"""
    serializer_class = RoleTokenObtainPairSerializer


class LogoutView(TokenBlacklistView):
    """Logout view"""
    pass


class MeView(views.APIView):
    """Get current user info"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "name": getattr(user, "name", "") or user.email,
            "role": "instructor" if user.is_instructor else "student",
        })


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view with authentication"""
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserProfileUpdateSerializer
        return UserProfileSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": f"خطا در به‌روزرسانی پروفایل: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
