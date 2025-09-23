from rest_framework import serializers
from .models import (
    Assignment,
    Question,
    RubricItem,
    StudentSubmission,
    # Annotation,  # Temporarily commented out
    Grade,
    Submission,
    SubmissionPageMap,
    SubmissionGrade,
)


class AssignmentSerializer(serializers.ModelSerializer):
    template_pdf = serializers.SerializerMethodField()
    total_submissions = serializers.SerializerMethodField()
    total_graded = serializers.SerializerMethodField()
    grading_progress = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "instructions",
            "due_at",
            "total_points",
            "is_published",
            "created_at",
            "course",
            "type",
            "template_pdf",
            "regrade_enabled",
            "anonymized_grading",
            "upload_by_student",
            "total_submissions",
            "total_graded",
            "grading_progress",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "total_submissions",
            "total_graded",
            "grading_progress",
            "total_points",
        ]

    def get_template_pdf(self, obj):
        if obj.template_pdf:
            # Return the relative URL to avoid host issues
            return obj.template_pdf.url
        return None

    def get_total_points(self, obj):
        """Calculate total points from sum of all question points"""
        from decimal import Decimal

        total = sum(question.max_points for question in obj.questions.all())
        return float(total)

    def get_total_submissions(self, obj):
        """Get total number of submissions for this assignment"""
        return obj.pdf_submissions.count()

    def get_total_graded(self, obj):
        """Get total number of graded question-submission pairs"""
        from .models import SubmissionGrade

        # Count total SubmissionGrade records (each represents a graded question for a submission)
        return SubmissionGrade.objects.filter(submission__assignment=obj).count()

    def get_grading_progress(self, obj):
        """Calculate overall grading progress percentage"""
        total_submissions = self.get_total_submissions(obj)
        total_questions = obj.questions.count()

        if total_submissions == 0 or total_questions == 0:
            return 0

        # Total possible question-submission pairs
        total_possible = total_submissions * total_questions
        total_graded = self.get_total_graded(obj)

        return int((total_graded / total_possible) * 100)


class HomeworkCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            "id",
            "course",
            "title",
            "template_pdf",
            "total_points",
            "due_at",
            "is_published",
            "created_at",
            "type",
            "regrade_enabled",
            "anonymized_grading",
            "upload_by_student",
            "created_by",
        ]
        read_only_fields = ["id", "created_at", "type", "created_by"]

    def validate(self, data):
        errors = {}

        # Required fields validation
        if not data.get("title"):
            errors["title"] = "نام تکلیف الزامی است"

        # Template PDF is optional for now (can be added later)
        # has_template = data.get("template_pdf") or (
        #     self.instance and self.instance.template_pdf
        # )
        # if not has_template:
        #     errors["template_pdf"] = "فایل تکلیف الزامی است"

        # Due date is optional for instructor uploads
        # if not data.get("due_at"):
        #     errors["due_at"] = "تاریخ تحویل الزامی است"

        # Validate total points
        total_points = data.get("total_points", 0)
        if total_points <= 0:
            errors["total_points"] = "نمره کل باید بیشتر از صفر باشد"

        if errors:
            raise serializers.ValidationError(errors)
        return data

    def create(self, validated_data):
        return super().create(validated_data)


class RubricItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = RubricItem
        fields = [
            "id",
            "question",
            "label",
            "delta_points",
            "order_index",
            "is_positive",
        ]


class QuestionSerializer(serializers.ModelSerializer):
    rubric_items = RubricItemSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "number",
            "title",
            "max_points",
            "order_index",
            "default_page_numbers",
            "rubric_items",
        ]


# New serializers for Gradescope-like functionality
class QuestionOutlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "title",
            "points",
            "page_number",
            "x_position",
            "y_position",
            "width",
            "height",
            "order",
        ]


class RubricItemOutlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = RubricItem
        fields = ["id", "title", "description", "points", "order"]


# Temporarily commented out AnnotationSerializer
# class AnnotationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Annotation
#         fields = [
#             "id",
#             "annotation_type",
#             "page_number",
#             "x_position",
#             "y_position",
#             "width",
#             "height",
#             "content",
#             "color",
#             "question",
#             "rubric_item",
#             "created_at",
#         ]
#         read_only_fields = ["id", "created_at"]

#     def create(self, validated_data):
#         # Set created_by if user is authenticated
#         request = self.context.get("request")
#         if request and request.user:
#             validated_data["created_by"] = request.user
#         return super().create(validated_data)


class StudentSubmissionSerializer(serializers.ModelSerializer):
    # annotations = AnnotationSerializer(many=True, read_only=True)

    class Meta:
        model = StudentSubmission
        fields = [
            "id",
            "assignment",
            "student",
            "submission_pdf",
            "submitted_at",
            # "annotations",
        ]
        read_only_fields = ["id", "submitted_at"]


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = [
            "id",
            "submission",
            "question",
            "points",
            "feedback",
            "created_at",
            "updated_at",
            "created_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        # Set created_by if user is authenticated
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


# New serializers for submission management
class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    mapping_status = serializers.ReadOnlyField()
    grading_progress = serializers.SerializerMethodField()
    total_questions = serializers.SerializerMethodField()
    graded_questions = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            "id",
            "assignment",
            "student",
            "student_name",
            "uploaded_by",
            "uploaded_by_name",
            "file",
            "num_pages",
            "created_at",
            "mapping_status",
            "grading_progress",
            "total_questions",
            "graded_questions",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "mapping_status",
            "grading_progress",
            "total_questions",
            "graded_questions",
        ]

    def get_student_name(self, obj):
        if obj.student:
            # Try to get the name field first, then fall back to first_name + last_name, then email
            if obj.student.name:
                return obj.student.name
            elif obj.student.first_name or obj.student.last_name:
                return f"{obj.student.first_name or ''} {obj.student.last_name or ''}".strip()
            else:
                return obj.student.email
        return "Unassigned"

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            # Try to get the name field first, then fall back to first_name + last_name, then email
            if obj.uploaded_by.name:
                return obj.uploaded_by.name
            elif obj.uploaded_by.first_name or obj.uploaded_by.last_name:
                return f"{obj.uploaded_by.first_name or ''} {obj.uploaded_by.last_name or ''}".strip()
            else:
                return obj.uploaded_by.email
        return "Unknown"

    def get_total_questions(self, obj):
        """Get total number of questions for this assignment"""
        return obj.assignment.questions.count()

    def get_graded_questions(self, obj):
        """Get number of questions that have been graded for this submission"""
        from .models import SubmissionGrade

        return SubmissionGrade.objects.filter(submission=obj).count()

    def get_grading_progress(self, obj):
        """Calculate grading progress percentage"""
        total_questions = self.get_total_questions(obj)
        if total_questions == 0:
            return 0
        graded_questions = self.get_graded_questions(obj)
        return int((graded_questions / total_questions) * 100)


class SubmissionPageMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionPageMap
        fields = ["id", "submission", "page_map", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_page_map(self, value):
        """Validate that page numbers are within valid range"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Page map must be a dictionary")

        # Get the submission to check num_pages
        submission = self.context.get("submission")
        if submission and hasattr(submission, "num_pages"):
            max_pages = submission.num_pages
            for question_id, pages in value.items():
                if not isinstance(pages, list):
                    raise serializers.ValidationError(
                        f"Pages for question {question_id} must be a list"
                    )
                for page in pages:
                    if not isinstance(page, int) or page < 1 or page > max_pages:
                        raise serializers.ValidationError(
                            f"Page {page} for question {question_id} must be between 1 and {max_pages}"
                        )

        return value


class SubmissionUploadSerializer(serializers.Serializer):
    """Serializer for handling file uploads"""

    files = serializers.ListField(
        child=serializers.FileField(),
        allow_empty=False,
        max_length=10,  # Limit to 10 files at once
    )
    student_ids = serializers.ListField(
        child=serializers.IntegerField(required=False), required=False, allow_empty=True
    )

    def validate(self, data):
        files = data.get("files", [])
        student_ids = data.get("student_ids", [])

        # If student_ids provided, they should match the number of files
        if student_ids and len(student_ids) != len(files):
            raise serializers.ValidationError(
                "Number of student IDs must match number of files"
            )

        return data


class SubmissionGradeSerializer(serializers.ModelSerializer):
    selected_item_ids = serializers.SerializerMethodField()

    class Meta:
        model = SubmissionGrade
        fields = [
            "id",
            "submission",
            "question",
            "selected_item_ids",
            "total_points",
            "updated_at",
        ]
        read_only_fields = ["id", "total_points", "updated_at"]

    def get_selected_item_ids(self, obj):
        return [item.id for item in obj.selected_items.all()]

    def update(self, instance, validated_data):
        # Handle selected_items separately
        selected_item_ids = self.initial_data.get("selected_item_ids", [])

        # Validate that all selected items belong to the question and are active
        question = instance.question
        valid_items = question.rubric_items.filter(
            id__in=selected_item_ids, is_active=True
        )

        if len(valid_items) != len(selected_item_ids):
            raise serializers.ValidationError(
                "Some selected items are invalid or inactive"
            )

        # Update the selected items
        instance.selected_items.set(valid_items)

        # Save to trigger total_points recalculation
        instance.save()

        return instance
