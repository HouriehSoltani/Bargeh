from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.urls import path
from django.shortcuts import render
from django.db.models import Count, Q


class BargehAdminSite(AdminSite):
    site_header = "Bargeh Course Management System"
    site_title = "Bargeh Admin"
    index_title = "Welcome to Bargeh Administration"

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path("dashboard/", self.admin_view(self.dashboard_view), name="dashboard"),
        ]
        return custom_urls + urls

    def dashboard_view(self, request):
        from users.models import User
        from courses.models import Course, CourseMembership
        from assignments.models import Assignment
        from submissions.models import Submission
        from grade.models import Grade

        context = {
            "title": "Bargeh Dashboard",
            "stats": {
                "total_users": User.objects.count(),
                "total_courses": Course.objects.count(),
                "total_assignments": Assignment.objects.count(),
                "total_submissions": Submission.objects.count(),
                "total_grades": Grade.objects.count(),
                "active_students": CourseMembership.objects.filter(
                    role=CourseMembership.Role.STUDENT
                )
                .values("user")
                .distinct()
                .count(),
                "instructors": CourseMembership.objects.filter(
                    role=CourseMembership.Role.INSTRUCTOR
                )
                .values("user")
                .distinct()
                .count(),
            },
            "recent_courses": Course.objects.select_related("instructor").order_by(
                "-created_at"
            )[:5],
            "recent_submissions": Submission.objects.select_related(
                "student", "assignment_version__assignment"
            ).order_by("-submitted_at")[:5],
        }
        return render(request, "admin/dashboard.html", context)


# Replace the default admin site
admin_site = BargehAdminSite(name="bargeh_admin")

# Register all models with the custom admin site
from django.contrib.auth.models import Group
from django.contrib.auth.admin import GroupAdmin
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.token_blacklist.admin import (
    BlacklistedTokenAdmin,
    OutstandingTokenAdmin,
)

# Register Django's built-in models
admin_site.register(Group, GroupAdmin)
admin_site.register(BlacklistedToken, BlacklistedTokenAdmin)
admin_site.register(OutstandingToken, OutstandingTokenAdmin)

# Register our custom models
from users.admin import UserAdmin
from users.models import User
from courses.admin import CourseAdmin, CourseMembershipAdmin
from courses.models import Course, CourseMembership
from assignments.admin import (
    AssignmentAdmin,
    QuestionAdmin,
    RubricItemAdmin,
)
from assignments.models import Assignment, Question, RubricItem
from submissions.admin import SubmissionAdmin
from submissions.models import Submission
from grade.admin import GradeAdmin, GradeRubricItemAdmin
from grade.models import Grade, GradeRubricItem

admin_site.register(User, UserAdmin)
admin_site.register(Course, CourseAdmin)
admin_site.register(CourseMembership, CourseMembershipAdmin)
admin_site.register(Assignment, AssignmentAdmin)
admin_site.register(Question, QuestionAdmin)
admin_site.register(RubricItem, RubricItemAdmin)
admin_site.register(Submission, SubmissionAdmin)
admin_site.register(Grade, GradeAdmin)
admin_site.register(GradeRubricItem, GradeRubricItemAdmin)
