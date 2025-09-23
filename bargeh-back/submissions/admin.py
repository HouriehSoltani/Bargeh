from django.contrib import admin
from django.utils.html import format_html
from .models import Submission


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "assignment",
        "status",
        "submitted_at",
        "late_minutes",
        "current_attempt",
    )
    list_filter = (
        "status",
        "submitted_at",
        "assignment__course",
        "current_attempt",
    )
    search_fields = (
        "student__email",
        "student__name",
        "assignment__title",
    )
    readonly_fields = ("submitted_at", "id")
    autocomplete_fields = ("student", "assignment")

    fieldsets = (
        (None, {"fields": ("assignment", "student", "current_attempt")}),
        ("Submission Details", {"fields": ("status", "late_minutes", "submitted_at")}),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("student", "assignment__course")
        )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing submission
            return self.readonly_fields + (
                "student",
                "assignment",
                "current_attempt",
            )
        return self.readonly_fields
