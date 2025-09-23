from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"", views.AssignmentViewSet, basename="assignment")
router.register(
    r"homework", views.HomeworkAssignmentViewSet, basename="homework-assignments"
)

urlpatterns = [
    path("", include(router.urls)),
    path("<int:assignment_id>/pdf/", views.serve_pdf, name="serve-pdf"),
    # Question management URLs
    path("<int:assignment_id>/questions/", views.get_questions, name="get-questions"),
    path(
        "<int:assignment_id>/questions/create/",
        views.create_questions,
        name="create-questions",
    ),
    path(
        "<int:assignment_id>/questions/update/",
        views.update_questions,
        name="update-questions",
    ),
    # Submission management URLs
    path(
        "<int:assignment_id>/submissions/student/upload/",
        views.upload_student_submission,
        name="upload-student-submission",
    ),
    path(
        "<int:assignment_id>/submissions/student/",
        views.get_student_submission,
        name="get-student-submission",
    ),
    path(
        "<int:assignment_id>/submissions/upload/",
        views.upload_submissions,
        name="upload-submissions",
    ),
    path(
        "<int:assignment_id>/submissions/",
        views.list_submissions,
        name="list-submissions",
    ),
    path(
        "submissions/<int:submission_id>/",
        views.get_submission_details,
        name="submission-details",
    ),
    path(
        "submissions/<int:submission_id>/page-map/",
        views.update_page_map,
        name="update-page-map",
    ),
    path(
        "submissions/<int:submission_id>/pages/",
        views.update_submission_pages,
        name="update-submission-pages",
    ),
    path(
        "submissions/<int:submission_id>/delete/",
        views.delete_submission,
        name="delete-submission",
    ),
    path(
        "submissions/<int:submission_id>/update-file/",
        views.update_submission_file,
        name="update-submission-file",
    ),
    # Grading endpoints
    path(
        "<int:assignment_id>/questions/<int:question_id>/grading-stats/",
        views.get_question_grading_stats,
        name="question-grading-stats",
    ),
    path(
        "<int:assignment_id>/questions/<int:question_id>/submissions/",
        views.get_question_submissions,
        name="question-submissions",
    ),
    path(
        "<int:assignment_id>/questions/<int:question_id>/submissions/<int:submission_id>/grade/",
        views.get_submission_grading_data,
        name="submission-grading-data",
    ),
    # Rubric items management URLs
    path(
        "<int:assignment_id>/questions/<int:question_id>/rubric-items/",
        views.get_rubric_items,
        name="get-rubric-items",
    ),
    path(
        "<int:assignment_id>/questions/<int:question_id>/rubric-items/create/",
        views.create_rubric_item,
        name="create-rubric-item",
    ),
    path(
        "<int:assignment_id>/rubric-items/<int:rubric_item_id>/",
        views.update_rubric_item,
        name="update-rubric-item",
    ),
    path(
        "<int:assignment_id>/rubric-items/<int:rubric_item_id>/delete/",
        views.delete_rubric_item,
        name="delete-rubric-item",
    ),
    # Submission grading URLs
    path(
        "<int:assignment_id>/submissions/<int:submission_id>/grades/<int:question_id>/",
        views.get_submission_grade,
        name="get-submission-grade",
    ),
    path(
        "<int:assignment_id>/submissions/<int:submission_id>/grades/<int:question_id>/update/",
        views.update_submission_grade,
        name="update-submission-grade",
    ),
    # Grade statistics and review endpoints
    path(
        "<int:assignment_id>/grade-statistics/",
        views.get_grade_statistics,
        name="grade-statistics",
    ),
    path(
        "<int:assignment_id>/student-grades/",
        views.get_student_grades,
        name="student-grades",
    ),
]
