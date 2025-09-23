from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class StudentSignupSerializer(serializers.ModelSerializer):
    """Signup allowed only for students"""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "password", "name")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Force student role
        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data.get("name", ""),
            password=validated_data["password"],
            is_instructor=False,  # Always create as student
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            attrs["user"] = user
            return attrs
        else:
            raise serializers.ValidationError("Must include email and password")


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "name", "date_joined", "last_login")
        read_only_fields = ("id", "date_joined", "last_login")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("name", "email", "first_name", "last_name")
        extra_kwargs = {
            "name": {"required": False},
            "email": {"required": False},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def validate_name(self, value):
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("نام باید حداقل 2 کاراکتر باشد")
        return value.strip() if value else value

    def validate_email(self, value):
        if value and not value.strip():
            raise serializers.ValidationError("ایمیل نمی‌تواند خالی باشد")
        return value.strip() if value else value
