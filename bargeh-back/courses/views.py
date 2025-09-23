from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.contrib.auth import get_user_model
from .models import Course, CourseMembership

User = get_user_model()
from .serializers import (
    CourseSerializer,
    CourseCreateSerializer,
    CourseUpdateSerializer,
    CourseMembershipSerializer,
    EnrollCourseSerializer,
    EnrollByCodeSerializer,
)
from common.permissions import IsAuthenticated
from rest_framework.permissions import IsAuthenticated, AllowAny


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Instructors see all courses (full access)
        if user.is_instructor:
            return Course.objects.all()

        # Students see courses they're enrolled in
        return Course.objects.filter(memberships__user=user).distinct()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CourseCreateSerializer
        return CourseSerializer


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Instructors can access all courses (full access)
        if user.is_instructor:
            return Course.objects.all()

        # Students can access courses they're enrolled in
        return Course.objects.filter(memberships__user=user).distinct()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return CourseUpdateSerializer
        return CourseSerializer

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": f"خطا در به‌روزرسانی درس: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()

        # Check if course has any assignments
        if course.assignments.exists():
            return Response(
                {
                    "detail": "Cannot delete course with existing assignments. Please delete all assignments first."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If no assignments, proceed with deletion
        return super().destroy(request, *args, **kwargs)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enroll_course(request):
    serializer = EnrollCourseSerializer(data=request.data)
    if serializer.is_valid():
        invite_code = serializer.validated_data["invite_code"]
        course = Course.objects.get(invite_code=invite_code)

        # Check if already enrolled
        if CourseMembership.objects.filter(user=request.user, course=course).exists():
            return Response(
                {"detail": "Already enrolled in this course"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Determine role based on user type
        user = request.user
        if user.is_superuser or user.is_staff or getattr(user, "is_instructor", False):
            # Admin and instructors enroll as students (to view the course)
            role = CourseMembership.Role.STUDENT
        else:
            # Regular users enroll as students
            role = CourseMembership.Role.STUDENT

        # Create membership
        membership = CourseMembership.objects.create(
            user=request.user, course=course, role=role
        )

        return Response(CourseSerializer(course, context={"request": request}).data)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CourseRosterView(generics.ListAPIView):
    serializer_class = CourseMembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs["course_id"]
        return CourseMembership.objects.filter(course_id=course_id)


class EnrollByCodeView(generics.CreateAPIView):
    """Enrollment via invite code (students and instructors)"""

    serializer_class = EnrollByCodeSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if user is already enrolled before saving
        user = request.user
        invite_code = serializer.validated_data["invite_code"]
        course = Course.objects.get(invite_code=invite_code)

        existing_membership = CourseMembership.objects.filter(
            user=user, course=course
        ).first()

        if existing_membership:
            # User is already enrolled
            return Response(
                {
                    "message": "شما قبلاً در این درس ثبت‌نام کرده‌اید",
                    "course": CourseSerializer(course).data,
                    "already_enrolled": True,
                },
                status=status.HTTP_200_OK,
            )

        # User is not enrolled, create new enrollment
        enrollment = serializer.save()

        return Response(
            {
                "message": "با موفقیت در درس ثبت نام شدید",
                "course": CourseSerializer(enrollment.course).data,
                "already_enrolled": False,
            },
            status=status.HTTP_201_CREATED,
        )


class UnenrollFromCourseView(generics.DestroyAPIView):
    """Unenroll from a course (all roles)"""

    permission_classes = [IsAuthenticated]

    def delete(self, request, course_id=None):
        try:
            course = Course.objects.get(id=course_id)
            user = request.user

            # Check if user is enrolled in the course
            membership = CourseMembership.objects.filter(
                user=user, course=course
            ).first()

            if not membership:
                return Response(
                    {"detail": "شما در این درس ثبت‌نام نکرده‌اید"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Delete the membership
            membership.delete()

            return Response(
                {
                    "message": f"با موفقیت از درس '{course.title}' انصراف دادید",
                    "course": CourseSerializer(course).data,
                },
                status=status.HTTP_200_OK,
            )

        except Course.DoesNotExist:
            return Response(
                {"detail": "درس یافت نشد"}, status=status.HTTP_404_NOT_FOUND
            )


class RemoveStudentFromCourseView(generics.DestroyAPIView):
    """Remove a student from a course (instructor only)"""

    permission_classes = [IsAuthenticated]

    def delete(self, request, course_id=None, membership_id=None):
        try:
            course = Course.objects.get(id=course_id)
            user = request.user

            # Check if user is instructor of this course
            if not course.is_instructor(user):
                return Response(
                    {"detail": "فقط استاد درس می‌تواند دانشجویان را حذف کند"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Get the membership to delete
            membership = CourseMembership.objects.filter(
                id=membership_id, course=course
            ).first()

            if not membership:
                return Response(
                    {"detail": "عضویت یافت نشد"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Store user info for response
            student_name = membership.user.name or membership.user.email
            student_role = membership.get_role_display()

            # Delete the membership
            membership.delete()

            return Response(
                {
                    "message": f"دانشجو '{student_name}' با موفقیت از درس حذف شد",
                    "removed_user": {
                        "name": student_name,
                        "email": membership.user.email,
                        "role": student_role,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Course.DoesNotExist:
            return Response(
                {"detail": "درس یافت نشد"}, status=status.HTTP_404_NOT_FOUND
            )


class AddUserToCourseView(generics.CreateAPIView):
    """Add an existing user to a course (instructor only)"""

    permission_classes = [IsAuthenticated]

    def post(self, request, course_id=None):
        try:
            course = Course.objects.get(id=course_id)
            user = request.user

            # Check if user is instructor of this course
            if not course.is_instructor(user):
                return Response(
                    {"detail": "فقط استاد درس می‌تواند کاربران را اضافه کند"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            email = request.data.get("email")
            if not email:
                return Response(
                    {"detail": "ایمیل کاربر الزامی است"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find the user by email
            try:
                user_to_add = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"detail": "کاربری با این ایمیل یافت نشد"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Check if user is already enrolled in this course
            if CourseMembership.objects.filter(
                user=user_to_add, course=course
            ).exists():
                return Response(
                    {"detail": "این کاربر قبلاً در این درس ثبت‌نام کرده است"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Determine role based on user type
            if user_to_add.is_instructor:
                role = CourseMembership.Role.INSTRUCTOR
            else:
                role = CourseMembership.Role.STUDENT

            # Create membership for the user
            membership = CourseMembership.objects.create(
                user=user_to_add, course=course, role=role
            )

            user_name = user_to_add.name or user_to_add.email
            role_display = (
                "استاد" if role == CourseMembership.Role.INSTRUCTOR else "دانشجو"
            )

            return Response(
                {
                    "message": f"کاربر '{user_name}' با نقش {role_display} با موفقیت به درس اضافه شد",
                    "added_user": {
                        "id": user_to_add.id,
                        "name": user_name,
                        "email": user_to_add.email,
                        "role": role,
                    },
                    "membership": {
                        "id": membership.id,
                        "created_at": membership.created_at,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        except Course.DoesNotExist:
            return Response(
                {"detail": "درس یافت نشد"}, status=status.HTTP_404_NOT_FOUND
            )
