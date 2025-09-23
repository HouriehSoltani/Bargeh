from django.db import models
from users.models import User


class Course(models.Model):
    class Term(models.TextChoices):
        FALL = "fall", "پاییز"
        WINTER = "winter", "زمستان"
        SPRING = "spring", "بهار"
        SUMMER = "summer", "تابستان"

    title = models.CharField(max_length=255)
    code = models.CharField(max_length=20, blank=True)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="owned_courses",
        null=True,
        blank=True,
    )
    invite_code = models.CharField(max_length=16, unique=True)
    term = models.CharField(max_length=10, choices=Term.choices, default=Term.SPRING)
    year = models.IntegerField(default=1403)  # Persian year
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

    def get_instructors(self):
        """Get all instructors for this course"""
        return self.memberships.filter(role=CourseMembership.Role.INSTRUCTOR)

    def get_students(self):
        """Get all students for this course"""
        return self.memberships.filter(role=CourseMembership.Role.STUDENT)

    def get_tas(self):
        """Get all TAs for this course"""
        return self.memberships.filter(role=CourseMembership.Role.TA)

    def is_instructor(self, user):
        """Check if user is an instructor of this course"""
        return self.memberships.filter(
            user=user, role=CourseMembership.Role.INSTRUCTOR
        ).exists()

    def is_student(self, user):
        """Check if user is a student in this course"""
        return self.memberships.filter(
            user=user, role=CourseMembership.Role.STUDENT
        ).exists()

    def is_member(self, user):
        """Check if user is any kind of member of this course"""
        return self.memberships.filter(user=user).exists()


class CourseMembership(models.Model):
    class Role(models.TextChoices):
        INSTRUCTOR = "instructor", "Instructor"
        TA = "ta", "TA"
        STUDENT = "student", "Student"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="memberships")
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="memberships"
    )
    role = models.CharField(max_length=12, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user.email} → {self.course.title} ({self.role})"

    def is_instructor(self):
        return self.role == self.Role.INSTRUCTOR

    def is_ta(self):
        return self.role == self.Role.TA

    def is_student(self):
        return self.role == self.Role.STUDENT
