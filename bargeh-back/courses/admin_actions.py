from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from .models import Course, CourseMembership


@admin.action(description="Publish selected courses")
def publish_courses(modeladmin, request, queryset):
    updated = queryset.update(is_published=True)
    modeladmin.message_user(
        request, f"{updated} course(s) were successfully published.", messages.SUCCESS
    )


@admin.action(description="Unpublish selected courses")
def unpublish_courses(modeladmin, request, queryset):
    updated = queryset.update(is_published=False)
    modeladmin.message_user(
        request, f"{updated} course(s) were successfully unpublished.", messages.SUCCESS
    )


@admin.action(description="Generate new invite codes")
def regenerate_invite_codes(modeladmin, request, queryset):
    import secrets
    import string

    updated = 0
    for course in queryset:
        # Generate a new 8-character invite code
        new_code = "".join(secrets.choices(string.ascii_uppercase + string.digits, k=8))
        course.invite_code = new_code
        course.save()
        updated += 1

    modeladmin.message_user(
        request,
        f"New invite codes generated for {updated} course(s).",
        messages.SUCCESS,
    )
