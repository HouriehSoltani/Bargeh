from django.db import models
from django.conf import settings
from courses.models import Course


class Assignment(models.Model):
    """Assignment model for storing assignment information"""

    class Type(models.TextChoices):
        HOMEWORK = "homework", "Homework"
        EXAM = "exam", "Exam"
        PROJECT = "project", "Project"
        QUIZ = "quiz", "Quiz"

    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="assignments"
    )
    title = models.CharField(max_length=255)
    instructions = models.TextField(blank=True)
    template_pdf = models.FileField(
        upload_to="assignment_templates/", blank=True, null=True
    )
    total_points = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    is_published = models.BooleanField(default=False)
    regrade_enabled = models.BooleanField(default=False)
    due_at = models.DateTimeField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.HOMEWORK)
    anonymized_grading = models.BooleanField(default=False)
    upload_by_student = models.BooleanField(
        default=True
    )  # True if students upload, False if instructor uploads
    allow_late = models.BooleanField(default=False)
    group_enabled = models.BooleanField(default=False)
    group_max_size = models.PositiveIntegerField(null=True, blank=True)
    late_due_at = models.DateTimeField(null=True, blank=True)
    release_at = models.DateTimeField(null=True, blank=True)
    time_limit_minutes = models.PositiveIntegerField(null=True, blank=True)
    variable_length = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_assignments",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.course.title}"

    def calculate_total_points(self):
        """Calculate total points from sum of all question points"""
        from decimal import Decimal

        total = sum(question.max_points for question in self.questions.all())
        return total

    def save(self, *args, **kwargs):
        """Override save to automatically calculate total_points"""
        # Only auto-calculate total_points if there are questions and no manual total_points set
        if self.pk and self.questions.exists():
            # If this is an update and there are questions, calculate from questions
            self.total_points = self.calculate_total_points()
        # If this is a new assignment or no questions exist, keep the manually set total_points
        super().save(*args, **kwargs)


class Question(models.Model):
    """Question model for assignment outline questions"""

    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="questions"
    )
    number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    max_points = models.DecimalField(max_digits=6, decimal_places=2, default=10.00)
    order_index = models.PositiveIntegerField(default=0)
    default_page_numbers = models.JSONField(
        default=list, blank=True
    )  # Array of page numbers

    class Meta:
        ordering = ["order_index", "number"]

    def __str__(self):
        return f"{self.title} - {self.assignment.title}"

    def save(self, *args, **kwargs):
        """Override save to update assignment total_points when question points change"""
        super().save(*args, **kwargs)
        # Update the assignment's total_points when question points change
        self.assignment.save()

    def delete(self, *args, **kwargs):
        """Override delete to update assignment total_points when question is deleted"""
        assignment = self.assignment
        super().delete(*args, **kwargs)
        # Update the assignment's total_points when question is deleted
        assignment.save()


class RubricItem(models.Model):
    """Rubric item model for grading criteria"""

    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="rubric_items"
    )
    label = models.CharField(max_length=255)
    delta_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    order_index = models.PositiveIntegerField(default=0)
    is_positive = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order_index"]

    def __str__(self):
        return f"{self.label} - {self.question.title}"


class Submission(models.Model):
    """Submission model for uploaded PDFs (instructor or student)"""

    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="pdf_submissions"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_submissions",
        null=True,
        blank=True,
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_submissions",
        null=True,
        blank=True,
    )
    file = models.FileField(upload_to="submissions/")
    num_pages = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        student_name = self.student.username if self.student else "Unassigned"
        return f"{student_name} - {self.assignment.title}"

    @property
    def mapping_status(self):
        """Returns 'complete' if all questions have pages mapped, else 'incomplete'"""
        if not hasattr(self, "page_map"):
            return "incomplete"

        # Get all questions for this assignment
        questions = self.assignment.questions.all()
        if not questions.exists():
            return "complete"  # No questions to map

        # Check if all questions have at least one page mapped
        for question in questions:
            question_id = str(question.id)
            if (
                question_id not in self.page_map.page_map
                or not self.page_map.page_map[question_id]
            ):
                return "incomplete"

        return "complete"


class SubmissionPageMap(models.Model):
    """Page mapping for submissions - stores question to page mapping as JSON"""

    submission = models.OneToOneField(
        Submission, on_delete=models.CASCADE, related_name="page_map"
    )
    page_map = models.JSONField(default=dict)  # {question_id: [page_numbers]}
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Page map for {self.submission}"


class StudentSubmission(models.Model):
    """Student submission model - keeping for backward compatibility"""

    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE, related_name="student_submissions_old"
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_submissions_old",
    )
    submission_pdf = models.FileField(
        upload_to="student_submissions/", blank=True, null=True
    )
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["assignment", "student"]
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class Annotation(models.Model):
    """Annotation model for PDF annotations"""

    ANNOTATION_TYPES = [
        ("text", "Text Comment"),
        ("pen", "Freehand Drawing"),
        ("rectangle", "Rectangle"),
        ("highlight", "Highlight"),
    ]

    submission = models.ForeignKey(
        StudentSubmission, on_delete=models.CASCADE, related_name="annotations_temp"
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="annotations_temp",
        null=True,
        blank=True,
    )
    rubric_item = models.ForeignKey(
        RubricItem,
        on_delete=models.CASCADE,
        related_name="annotations_temp",
        null=True,
        blank=True,
    )
    annotation_type = models.CharField(max_length=20, choices=ANNOTATION_TYPES)
    page_number = models.PositiveIntegerField()
    x_position = models.FloatField()
    y_position = models.FloatField()
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)
    content = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#2E5BBA")  # Hex color
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_annotations",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.annotation_type} - {self.submission.student.username}"


class Grade(models.Model):
    """Grade model for storing assignment grades"""

    submission = models.ForeignKey(
        StudentSubmission, on_delete=models.CASCADE, related_name="assignment_grades"
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="assignment_grades"
    )
    points = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    feedback = models.TextField(blank=True)
    applied = models.BooleanField(default=False)
    applied_at = models.DateTimeField(auto_now_add=True)
    applied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applied_grades",
    )
    rubric_item = models.ForeignKey(
        RubricItem,
        on_delete=models.CASCADE,
        related_name="applied_grades",
        null=True,
        blank=True,
    )

    class Meta:
        unique_together = ["submission", "question"]
        ordering = ["-applied_at"]

    def __str__(self):
        student_name = (
            self.submission.student.username
            if self.submission.student
            else "Unassigned"
        )
        return f"{student_name} - {self.question.title} - {self.points} points"


class SubmissionGrade(models.Model):
    """Submission grade model for storing grading state for one submission & one question"""

    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="grades"
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="submission_grades"
    )
    selected_items = models.ManyToManyField(
        RubricItem, related_name="selected_in_grades", blank=True
    )
    total_points = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["submission", "question"]
        ordering = ["-updated_at"]

    def __str__(self):
        student_name = (
            self.submission.student.name
            if self.submission.student
            and hasattr(self.submission.student, "name")
            and self.submission.student.name
            else (
                self.submission.student.first_name
                + " "
                + self.submission.student.last_name
                if self.submission.student and self.submission.student.first_name
                else (
                    self.submission.student.email
                    if self.submission.student
                    else "Unassigned"
                )
            )
        )
        return f"{student_name} - {self.question.title} - {self.total_points} points"

    def calculate_total_points(self):
        """Calculate total points based on question max_points and selected rubric items"""
        from decimal import Decimal

        # Start with question max points
        base_points = self.question.max_points

        # Add points delta from selected items
        delta_sum = sum(item.delta_points for item in self.selected_items.all())

        # Clamp to [0, question.max_points]
        total = max(
            Decimal("0"), min(base_points + delta_sum, self.question.max_points)
        )

        return total

    def save(self, *args, **kwargs):
        """Override save to automatically calculate total_points"""
        # Only calculate total_points if the object is being updated (has an ID)
        # For new objects, use the default value
        if self.pk:
            self.total_points = self.calculate_total_points()
        super().save(*args, **kwargs)
