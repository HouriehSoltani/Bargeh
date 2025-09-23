from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAuthenticated(BasePermission):
    """Simple authentication check - all authenticated users can access"""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
