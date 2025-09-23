from django.db import models
from users.models import User
from submissions.models import Submission
from assignments.models import Question, RubricItem


class Grade(models.Model):
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="grades"
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="grades"
    )
    grader = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="grades_given"
    )
    points_awarded = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    point_adjustment = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    comment = models.TextField(blank=True)
    graded_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("submission", "question")

    def __str__(self):
        return f"Grade {self.points_awarded} for {self.question} (Submission {self.submission.id})"


class GradeRubricItem(models.Model):
    grade = models.ForeignKey(
        Grade, on_delete=models.CASCADE, related_name="selected_items"
    )
    rubric_item = models.ForeignKey(RubricItem, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("grade", "rubric_item")

    def __str__(self):
        return f"{self.grade.id} → {self.rubric_item.label}"
