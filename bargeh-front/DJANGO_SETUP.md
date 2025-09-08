# Django Backend Setup Guide

This guide will help you set up a Django backend to work with your React frontend.

## 1. Django Project Setup

### Create Django Project
```bash
# Create a new Django project
django-admin startproject bargeh_backend
cd bargeh_backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Django and required packages
pip install django djangorestframework django-cors-headers python-decouple
```

### Project Structure
```
bargeh_backend/
├── manage.py
├── bargeh_backend/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── courses/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── admin.py
├── authentication/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
└── requirements.txt
```

## 2. Django Settings Configuration

### settings.py
```python
import os
from decouple import config

# ... existing code ...

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'authentication',
    'courses',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS settings for React frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

## 3. Authentication App

### models.py
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
```

### serializers.py
```python
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include username and password')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login')
        read_only_fields = ('id', 'date_joined', 'last_login')
```

### views.py
```python
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
```

### urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
]
```

## 4. Courses App

### models.py
```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    title = models.CharField(max_length=200)
    course_code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='taught_courses')
    term = models.CharField(max_length=50)
    year = models.CharField(max_length=10)
    department = models.CharField(max_length=100, blank=True)
    entry_code = models.CharField(max_length=20, blank=True)
    allow_entry_code = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'course']
    
    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    due_date = models.DateTimeField()
    points = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['due_date']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"
```

### serializers.py
```python
from rest_framework import serializers
from .models import Course, Enrollment, Assignment
from authentication.serializers import UserProfileSerializer

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserProfileSerializer(read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ('instructor', 'created_at', 'updated_at')
    
    def get_enrolled_students_count(self, obj):
        return obj.enrollments.count()
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False
    
    def create(self, validated_data):
        validated_data['instructor'] = self.context['request'].user
        return super().create(validated_data)

class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ('student', 'enrolled_at')

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = ('created_at',)
```

### views.py
```python
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Enrollment, Assignment
from .serializers import CourseSerializer, EnrollmentSerializer, AssignmentSerializer

class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return courses where user is enrolled or is instructor
        user = self.request.user
        return Course.objects.filter(
            models.Q(enrollments__student=user) | models.Q(instructor=user)
        ).distinct()

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Course.objects.filter(
            models.Q(enrollments__student=user) | models.Q(instructor=user)
        ).distinct()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    entry_code = request.data.get('entryCode')
    if not entry_code:
        return Response({'detail': 'Entry code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        course = Course.objects.get(entry_code=entry_code, allow_entry_code=True)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course
        )
        if created:
            return Response(CourseSerializer(course, context={'request': request}).data)
        else:
            return Response({'detail': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
    except Course.DoesNotExist:
        return Response({'detail': 'Invalid entry code'}, status=status.HTTP_400_BAD_REQUEST)

class AssignmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Assignment.objects.filter(course_id=course_id)

class RosterListView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Enrollment.objects.filter(course_id=course_id)
```

### urls.py
```python
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.CourseListCreateView.as_view(), name='course-list'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('enroll/', views.enroll_course, name='enroll-course'),
    path('create/', views.CourseListCreateView.as_view(), name='create-course'),
    path('<int:course_id>/assignments/', views.AssignmentListCreateView.as_view(), name='assignment-list'),
    path('<int:course_id>/roster/', views.RosterListView.as_view(), name='roster-list'),
    path('<int:course_id>/settings/', views.CourseDetailView.as_view(), name='course-settings'),
]
```

## 5. Main URLs Configuration

### bargeh_backend/urls.py
```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/courses/', include('courses.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## 6. Database Setup

```bash
# Create and run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

## 7. Environment Variables

Create a `.env` file in your Django project root:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 8. Testing the API

You can test your API endpoints using curl or Postman:

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "testpass123", "first_name": "Test", "last_name": "User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# Get courses (with JWT token)
curl -X GET http://localhost:8000/api/courses/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 9. Frontend Integration

Your React frontend is now configured to work with this Django backend. The API calls will be automatically proxied through Vite's development server to avoid CORS issues.

Make sure your Django server is running on `http://localhost:8000` and your React app on `http://localhost:5173`.
