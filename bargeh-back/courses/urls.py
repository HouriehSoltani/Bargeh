from django.urls import path
from . import views

urlpatterns = [
    path("", views.CourseListCreateView.as_view(), name="course-list"),
    path("<int:pk>/", views.CourseDetailView.as_view(), name="course-detail"),
    path("enroll/", views.enroll_course, name="enroll-course"),
    path("enroll/by-code/", views.EnrollByCodeView.as_view(), name="enroll-by-code"),
    path(
        "<int:course_id>/unenroll/",
        views.UnenrollFromCourseView.as_view(),
        name="unenroll-from-course",
    ),
    path(
        "<int:course_id>/roster/", views.CourseRosterView.as_view(), name="roster-list"
    ),
    path(
        "<int:course_id>/roster/<int:membership_id>/remove/",
        views.RemoveStudentFromCourseView.as_view(),
        name="remove-student-from-course",
    ),
    path(
        "<int:course_id>/roster/add/",
        views.AddUserToCourseView.as_view(),
        name="add-user-to-course",
    ),
]
