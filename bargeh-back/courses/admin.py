from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Course, CourseMembership
from .admin_actions import publish_courses, unpublish_courses, regenerate_invite_codes


class CourseMembershipInline(admin.TabularInline):
    model = CourseMembership
    extra = 0
    readonly_fields = ("created_at",)
    fields = ("user", "role", "created_at")
    autocomplete_fields = ("user",)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "title",
        "owner",
        "student_count",
        "invite_code",
        "created_at",
    )
    list_filter = ("created_at", "owner")
    search_fields = (
        "title",
        "code",
        "description",
        "owner__email",
        "owner__name",
    )
    readonly_fields = ("created_at", "invite_code", "id")
    autocomplete_fields = ("owner",)
    inlines = [CourseMembershipInline]
    actions = [regenerate_invite_codes]

    fieldsets = (
        (None, {"fields": ("title", "code", "description", "owner")}),
        (
            "Course Details",
            {"fields": ("invite_code", "created_at"), "classes": ("collapse",)},
        ),
    )

    def student_count(self, obj):
        return obj.memberships.filter(role=CourseMembership.Role.STUDENT).count()

    student_count.short_description = "Students"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("owner")
            .prefetch_related("memberships")
        )


@admin.register(CourseMembership)
class CourseMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "role", "created_at")
    list_filter = ("role", "created_at", "course")
    search_fields = ("user__email", "user__name", "course__title", "course__code")
    readonly_fields = ("created_at",)
    autocomplete_fields = ("user", "course")

    fieldsets = (
        (None, {"fields": ("user", "course", "role")}),
        ("Timestamps", {"fields": ("created_at",), "classes": ("collapse",)}),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "course")
