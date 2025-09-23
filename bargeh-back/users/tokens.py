from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Simple role determination: instructor or student
        token["role"] = "instructor" if user.is_instructor else "student"
        token["email"] = user.email
        token["name"] = getattr(user, "name", "") or user.email
        return token
