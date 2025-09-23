from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Assignment,
    Question,
    RubricItem,
    StudentSubmission,
    Annotation,
    Grade,
    Submission,
    SubmissionPageMap,
    SubmissionGrade,
)


# RubricItemInline temporarily removed due to model relationship changes
# class RubricItemInline(admin.TabularInline):
#     model = RubricItem
#     extra = 0
#     fields = ("label", "delta_points", "description", "order_index", "is_positive")
#     ordering = ("order_index",)


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = (
        "number",
        "title",
        "max_points",
        "order_index",
    )
    ordering = ("order_index",)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "course",
        "due_at",
        "total_points",
        "is_published",
        "question_count",
        "created_at",
    )
    list_filter = ("is_published", "created_at", "course")
    search_fields = ("title", "instructions", "course__title", "course__code")
    readonly_fields = ("created_at", "id")
    autocomplete_fields = ("course",)
    inlines = [QuestionInline]

    fieldsets = (
        (None, {"fields": ("course", "title", "instructions")}),
        ("Assignment Details", {"fields": ("due_at", "total_points", "is_published")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    def question_count(self, obj):
        return obj.questions.count()

    question_count.short_description = "Questions"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("course")
            .prefetch_related("questions")
        )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = (
        "assignment",
        "number",
        "title",
        "max_points",
        "rubric_count",
    )
    list_filter = ("assignment__course",)
    search_fields = ("title", "assignment__title")
    readonly_fields = ("id",)
    # inlines = [RubricItemInline]  # Temporarily disabled due to model relationship changes

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "assignment",
                    "number",
                    "title",
                    "max_points",
                    "order_index",
                    "default_page_numbers",
                )
            },
        ),
    )

    def rubric_count(self, obj):
        # RubricItem is related to Question
        return obj.rubric_items.count()

    rubric_count.short_description = "Rubric Items"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("assignment__course")
            .prefetch_related("rubric_items")
        )


@admin.register(RubricItem)
class RubricItemAdmin(admin.ModelAdmin):
    list_display = ("question", "label", "delta_points", "order_index", "is_positive")
    list_filter = ("question__assignment__course", "is_positive")
    search_fields = (
        "label",
        "question__title",
        "question__assignment__title",
    )

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "question",
                    "label",
                    "delta_points",
                    "order_index",
                    "is_positive",
                )
            },
        ),
    )

    def get_queryset(self, request):
        return (
            super().get_queryset(request).select_related("question__assignment__course")
        )


@admin.register(StudentSubmission)
class StudentSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "assignment",
        "student",
        "submitted_at",
    )
    list_filter = ("submitted_at", "assignment__course")
    search_fields = ("student__username", "student__email", "assignment__title")
    readonly_fields = ("submitted_at", "id")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "assignment",
                    "student",
                    "submission_pdf",
                )
            },
        ),
        ("Timestamps", {"fields": ("submitted_at",), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("assignment__course", "student")
        )


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = (
        "submission",
        "annotation_type",
        "page_number",
        "created_by",
        "created_at",
    )
    list_filter = ("annotation_type", "page_number", "created_at")
    search_fields = (
        "content",
        "submission__student__username",
        "submission__assignment__title",
    )
    readonly_fields = ("created_at", "id")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "submission",
                    "question",
                    "rubric_item",
                    "annotation_type",
                    "page_number",
                    "x_position",
                    "y_position",
                    "width",
                    "height",
                    "content",
                    "color",
                    "created_by",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "submission__student", "submission__assignment", "created_by"
            )
        )


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = (
        "submission",
        "question",
        "points",
        "applied_by",
        "applied_at",
    )
    list_filter = ("applied_at", "question__assignment__course")
    search_fields = (
        "submission__student__username",
        "question__title",
        "feedback",
    )
    readonly_fields = ("applied_at", "id")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "submission",
                    "question",
                    "points",
                    "feedback",
                    "applied_by",
                    "rubric_item",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("applied_at",), "classes": ("collapse",)},
        ),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "submission__student",
                "submission__assignment",
                "question",
                "created_by",
            )
        )


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "assignment",
        "student_name",
        "uploaded_by_name",
        "num_pages",
        "mapping_status",
        "created_at",
    )
    list_filter = ("assignment__course", "created_at")
    search_fields = (
        "assignment__title",
        "student__username",
        "uploaded_by__username",
    )
    readonly_fields = ("created_at", "id", "mapping_status")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "assignment",
                    "student",
                    "uploaded_by",
                    "file",
                    "num_pages",
                    "mapping_status",
                )
            },
        ),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    def student_name(self, obj):
        return obj.student.username if obj.student else "Unassigned"

    student_name.short_description = "Student"

    def uploaded_by_name(self, obj):
        return obj.uploaded_by.username if obj.uploaded_by else "Unknown"

    uploaded_by_name.short_description = "Uploaded By"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("assignment__course", "student", "uploaded_by")
        )


@admin.register(SubmissionPageMap)
class SubmissionPageMapAdmin(admin.ModelAdmin):
    list_display = (
        "submission",
        "page_map_preview",
        "created_at",
        "updated_at",
    )
    list_filter = ("created_at", "updated_at")
    search_fields = (
        "submission__assignment__title",
        "submission__student__username",
    )
    readonly_fields = ("created_at", "updated_at", "id")

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "submission",
                    "page_map",
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def page_map_preview(self, obj):
        if obj.page_map:
            return f"{len(obj.page_map)} questions mapped"
        return "No mapping"

    page_map_preview.short_description = "Page Map"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("submission__assignment__course", "submission__student")
        )


@admin.register(SubmissionGrade)
class SubmissionGradeAdmin(admin.ModelAdmin):
    list_display = (
        "submission",
        "question",
        "total_points",
        "selected_items_count",
        "updated_at",
    )
    list_filter = ("updated_at", "question__assignment__course")
    search_fields = (
        "submission__student__username",
        "question__title",
    )
    readonly_fields = ("updated_at", "id", "total_points")
    filter_horizontal = ("selected_items",)

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "submission",
                    "question",
                    "selected_items",
                    "total_points",
                )
            },
        ),
        ("Timestamps", {"fields": ("updated_at",), "classes": ("collapse",)}),
    )

    def selected_items_count(self, obj):
        return obj.selected_items.count()

    selected_items_count.short_description = "Selected Items"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "submission__student",
                "submission__assignment",
                "question",
            )
            .prefetch_related("selected_items")
        )
