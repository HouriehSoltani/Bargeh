from django.contrib import admin
from django.utils.html import format_html
from .models import Grade, GradeRubricItem


class GradeRubricItemInline(admin.TabularInline):
    model = GradeRubricItem
    extra = 0
    fields = ("rubric_item",)
    autocomplete_fields = ("rubric_item",)


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = (
        "submission",
        "question",
        "grader",
        "points_awarded",
        "point_adjustment",
        "graded_at",
    )
    list_filter = (
        "graded_at",
        "submission__assignment__course",
        "grader",
    )
    search_fields = ("submission__student__email", "question__title", "grader__email")
    readonly_fields = ("graded_at", "id")
    autocomplete_fields = ("submission", "question", "grader")
    inlines = [GradeRubricItemInline]

    fieldsets = (
        (None, {"fields": ("submission", "question", "grader")}),
        (
            "Grading Details",
            {"fields": ("points_awarded", "point_adjustment", "comment")},
        ),
        ("Timestamps", {"fields": ("graded_at",), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "submission__student",
                "submission__assignment__course",
                "question__assignment__course",
                "grader",
            )
            .prefetch_related("selected_items__rubric_item")
        )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing grade
            return self.readonly_fields + ("submission", "question")
        return self.readonly_fields


@admin.register(GradeRubricItem)
class GradeRubricItemAdmin(admin.ModelAdmin):
    list_display = ("grade", "rubric_item", "rubric_points")
    list_filter = ("grade__submission__assignment__course",)
    search_fields = ("grade__submission__student__email", "rubric_item__label")
    autocomplete_fields = ("grade", "rubric_item")

    fieldsets = ((None, {"fields": ("grade", "rubric_item")}),)

    def rubric_points(self, obj):
        return obj.rubric_item.delta_points

    rubric_points.short_description = "Points"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "grade__submission__student",
                "grade__submission__assignment__course",
                "rubric_item__question__assignment__course",
            )
        )
