from django.db import models
from users.models import User
from assignments.models import Assignment


class Submission(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        GRADED = "graded", "Graded"
        RELEASED = "released", "Released"

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
        default=1,
    )
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="submissions"
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )
    late_minutes = models.IntegerField(default=0)
    current_attempt = models.IntegerField(default=1)

    class Meta:
        unique_together = ("student", "assignment", "current_attempt")

    def __str__(self):
        return f"Submission by {self.student.email} to {self.assignment}"
