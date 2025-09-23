from django.shortcuts import get_object_or_404
from django.http import HttpResponse, Http404, FileResponse
from django.conf import settings
from django.db import models
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework import generics
from rest_framework.decorators import action
import os
import mimetypes
from .models import (
    Assignment,
    Submission,
    SubmissionPageMap,
    Question,
    RubricItem,
    SubmissionGrade,
)
from .serializers import (
    AssignmentSerializer,
    HomeworkCreateSerializer,
    SubmissionSerializer,
    SubmissionPageMapSerializer,
    SubmissionUploadSerializer,
    QuestionSerializer,
    RubricItemSerializer,
    SubmissionGradeSerializer,
)


class AssignmentViewSet(ModelViewSet):
    """ViewSet for managing assignments"""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Instructors see all assignments (full access)
        if user.is_instructor:
            return Assignment.objects.all()

        # Students see assignments from courses they're enrolled in
        return Assignment.objects.filter(course__memberships__user=user).distinct()

    def get_serializer_class(self):
        if hasattr(self, "action") and self.action == "create":
            return HomeworkCreateSerializer
        return AssignmentSerializer

    def perform_create(self, serializer):
        # Set the created_by field to the current user
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def get_course_assignments(self, request, course_id=None):
        """Get all assignments for a specific course"""
        user = request.user

        # Base queryset with course filter
        queryset = Assignment.objects.filter(course_id=course_id)

        # Apply role-based filtering
        if not user.is_instructor:
            # Students see assignments from courses they're enrolled in
            queryset = queryset.filter(course__memberships__user=user)

        # Serialize and return
        serializer = self.get_serializer(queryset, many=True)
        return Response({"results": serializer.data, "count": queryset.count()})


class HomeworkAssignmentViewSet(ModelViewSet):
    """ViewSet specifically for homework assignments"""

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Instructors see all homework assignments
        if user.is_instructor:
            return Assignment.objects.filter(type="homework")

        # Students see homework assignments from courses they're enrolled in
        return Assignment.objects.filter(
            type="homework", course__memberships__user=user
        ).distinct()

    def get_serializer_class(self):
        if hasattr(self, "action") and self.action == "create":
            return HomeworkCreateSerializer
        return AssignmentSerializer

    def perform_create(self, serializer):
        # Set the created_by field to the current user and ensure it's homework type
        serializer.save(created_by=self.request.user, type="homework")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def serve_pdf(request, assignment_id):
    """
    Serve PDF files with proper headers for iframe embedding
    """
    from .models import Assignment

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)

        if not assignment.template_pdf:
            raise Http404("No PDF file found for this assignment")

        # Get the file path
        file_path = os.path.join(settings.MEDIA_ROOT, str(assignment.template_pdf))

        if not os.path.exists(file_path):
            raise Http404("PDF file not found on disk")

        # Get the file's MIME type
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = "application/pdf"

        # Use FileResponse for better performance and range request support
        response = FileResponse(
            open(file_path, "rb"), content_type=content_type, as_attachment=False
        )

        # Set headers for better PDF serving
        response["Content-Disposition"] = (
            f'inline; filename="{os.path.basename(file_path)}"'
        )
        response["Accept-Ranges"] = (
            "bytes"  # Enable range requests for smooth seeking/zooming
        )
        response["Cache-Control"] = "public, max-age=3600"  # Cache for 1 hour
        response["X-Frame-Options"] = "SAMEORIGIN"  # Allow iframe embedding

        return response

    except Exception as e:
        return Response(
            {"error": f"Error serving PDF: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Submission management views
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_submissions(request, assignment_id):
    """Upload one or more PDF files for an assignment"""
    from users.models import User

    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can upload submissions"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)

        # Parse the upload data
        files = request.FILES.getlist("files")
        student_ids = request.data.getlist("student_ids", [])

        if not files:
            return Response(
                {"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        created_submissions = []

        for i, file in enumerate(files):
            # Get student if provided
            student = None
            if i < len(student_ids) and student_ids[i]:
                try:
                    student = User.objects.get(id=student_ids[i])
                    print(
                        f"Found student: {student.name or student.email} (ID: {student.id})"
                    )
                except User.DoesNotExist:
                    print(f"Student with ID {student_ids[i]} not found")
                    continue  # Skip this file if student not found

            print(
                f"Creating submission for student: {student.name if student else 'None'}"
            )

            # Get page count from request if provided, otherwise default to 1
            # The frontend will update this after PDF loads
            num_pages = request.data.get("num_pages", 1)
            if isinstance(num_pages, str):
                try:
                    num_pages = int(num_pages)
                except ValueError:
                    num_pages = 1

            # Create submission
            submission = Submission.objects.create(
                assignment=assignment,
                uploaded_by=request.user,
                student=student,
                file=file,
                num_pages=num_pages,
            )

            print(f"Created submission with student: {submission.student}")

            # Create empty page map
            SubmissionPageMap.objects.create(submission=submission, page_map={})

            created_submissions.append(submission)

        # Serialize and return
        serializer = SubmissionSerializer(created_submissions, many=True)
        return Response(
            {
                "message": f"Successfully uploaded {len(created_submissions)} files",
                "submissions": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"error": f"Error uploading files: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_submissions(request, assignment_id):
    """List all submissions for an assignment"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can view submissions"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        submissions = Submission.objects.filter(assignment=assignment)

        print(f"Found {submissions.count()} submissions for assignment {assignment_id}")
        for submission in submissions:
            print(
                f"Submission {submission.id}: student={submission.student}, student_name={submission.student.name if submission.student else 'None'}"
            )

        serializer = SubmissionSerializer(submissions, many=True)
        print(f"Serialized data: {serializer.data}")
        return Response({"results": serializer.data, "count": submissions.count()})

    except Exception as e:
        return Response(
            {"error": f"Error fetching submissions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_student_submission(request, assignment_id):
    """Get a student's own submission for an assignment"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)

        # For students, only allow them to see their own submission
        if not request.user.is_instructor:
            submission = Submission.objects.filter(
                assignment=assignment, student=request.user
            ).first()
        else:
            # For instructors, they can see any submission
            submission = Submission.objects.filter(assignment=assignment).first()

        if not submission:
            return Response(
                {"error": "No submission found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SubmissionSerializer(submission)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {"error": f"Error fetching submission: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST", "PUT"])
@permission_classes([IsAuthenticated])
def upload_student_submission(request, assignment_id):
    """Upload or update a student's submission for an assignment"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)

        # Only allow students to upload their own submissions
        if request.user.is_instructor:
            return Response(
                {"error": "Instructors cannot upload student submissions"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Check if student already has a submission
        existing_submission = Submission.objects.filter(
            assignment=assignment, student=request.user
        ).first()

        # For POST requests, don't allow if submission already exists
        if request.method == "POST" and existing_submission:
            return Response(
                {"error": "You already have a submission for this assignment"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # For PUT requests, require existing submission
        if request.method == "PUT" and not existing_submission:
            return Response(
                {"error": "No existing submission found to update"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get the uploaded file
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        if not file.name.lower().endswith(".pdf"):
            return Response(
                {"error": "Only PDF files are allowed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.method == "POST":
            # Create new submission
            submission = Submission.objects.create(
                assignment=assignment,
                student=request.user,
                file=file,
                num_pages=1,  # Will be updated when PDF is processed
            )

            # Create empty page map
            SubmissionPageMap.objects.create(submission=submission, page_map={})

            serializer = SubmissionSerializer(submission)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        else:  # PUT request
            # Update existing submission
            existing_submission.file = file
            existing_submission.num_pages = 1  # Will be updated when PDF is processed
            existing_submission.save()

            serializer = SubmissionSerializer(existing_submission)
            return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error uploading submission: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_submission_pages(request, submission_id):
    """Update the page count for a submission"""
    try:
        submission = get_object_or_404(Submission, id=submission_id)

        # For students, only allow them to update their own submissions
        if not request.user.is_instructor and submission.student != request.user:
            return Response(
                {"error": "You can only update your own submissions"},
                status=status.HTTP_403_FORBIDDEN,
            )
        num_pages = request.data.get("num_pages")

        if num_pages is not None:
            submission.num_pages = int(num_pages)
            submission.save()
            print(f"Updated submission {submission_id} to have {num_pages} pages")

        serializer = SubmissionSerializer(submission)
        return Response(serializer.data)

    except Exception as e:
        print(f"Error updating submission pages: {str(e)}")
        return Response(
            {"error": f"Error updating submission: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_submission_details(request, submission_id):
    """Get detailed information about a submission including page map"""
    try:
        submission = get_object_or_404(Submission, id=submission_id)

        # For students, only allow them to view their own submissions
        if not request.user.is_instructor and submission.student != request.user:
            return Response(
                {"error": "You can only view your own submissions"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get submission data
        submission_data = SubmissionSerializer(submission).data

        # Get page map if it exists
        page_map_data = {}
        try:
            page_map_obj = SubmissionPageMap.objects.get(submission=submission)
            page_map_data = page_map_obj.page_map
            print(f"Found page map for submission {submission_id}: {page_map_data}")
        except SubmissionPageMap.DoesNotExist:
            print(f"No page map found for submission {submission_id}")
            page_map_data = {}

        # Get assignment questions for reference
        questions = Question.objects.filter(assignment=submission.assignment).order_by(
            "order_index"
        )
        questions_data = QuestionSerializer(questions, many=True).data

        return Response(
            {
                "submission": submission_data,
                "page_map": page_map_data,
                "questions": questions_data,
            }
        )

    except Exception as e:
        return Response(
            {"error": f"Error fetching submission details: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_page_map(request, submission_id):
    """Update the page mapping for a submission"""
    try:
        submission = get_object_or_404(Submission, id=submission_id)

        # For students, only allow them to update their own submissions
        if not request.user.is_instructor and submission.student != request.user:
            return Response(
                {"error": "You can only update your own submissions"},
                status=status.HTTP_403_FORBIDDEN,
            )
        page_map_data = request.data.get("page_map", {})

        # Validate page numbers
        for question_id, pages in page_map_data.items():
            if not isinstance(pages, list):
                return Response(
                    {"error": f"Pages for question {question_id} must be a list"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            for page in pages:
                if not isinstance(page, int) or page < 1 or page > submission.num_pages:
                    return Response(
                        {
                            "error": f"Page {page} for question {question_id} must be between 1 and {submission.num_pages}"
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        # Get or create page map
        page_map, created = SubmissionPageMap.objects.get_or_create(
            submission=submission, defaults={"page_map": page_map_data}
        )

        if not created:
            page_map.page_map = page_map_data
            page_map.save()
            print(
                f"Updated existing page map for submission {submission_id}: {page_map.page_map}"
            )
        else:
            print(
                f"Created new page map for submission {submission_id}: {page_map.page_map}"
            )

        return Response(
            {"message": "Page map updated successfully", "page_map": page_map.page_map}
        )

    except Exception as e:
        return Response(
            {"error": f"Error updating page map: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_submission(request, submission_id):
    """Delete a submission"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can delete submissions"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        submission = get_object_or_404(Submission, id=submission_id)

        # Delete associated page map if it exists
        try:
            page_map = SubmissionPageMap.objects.get(submission=submission)
            page_map.delete()
            print(f"Deleted page map for submission {submission_id}")
        except SubmissionPageMap.DoesNotExist:
            print(f"No page map found for submission {submission_id}")

        # Delete the submission file if it exists
        if submission.file:
            try:
                submission.file.delete(save=False)
                print(f"Deleted file for submission {submission_id}")
            except Exception as e:
                print(f"Error deleting file for submission {submission_id}: {e}")

        # Delete the submission
        submission.delete()
        print(f"Deleted submission {submission_id}")

        return Response(
            {"message": "Submission deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

    except Exception as e:
        print(f"Error deleting submission: {str(e)}")
        return Response(
            {"error": f"Error deleting submission: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_submission_file(request, submission_id):
    """Update the file for a submission"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can update submission files"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        submission = get_object_or_404(Submission, id=submission_id)

        # Get the new file from request
        new_file = request.FILES.get("file")
        if not new_file:
            return Response(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        if not new_file.name.lower().endswith(".pdf"):
            return Response(
                {"error": "Only PDF files are allowed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete old file if it exists
        if submission.file:
            try:
                submission.file.delete(save=False)
                print(f"Deleted old file for submission {submission_id}")
            except Exception as e:
                print(f"Error deleting old file for submission {submission_id}: {e}")

        # Update submission with new file
        submission.file = new_file

        # Calculate new page count (default to 1, will be updated by frontend)
        submission.num_pages = 1

        submission.save()
        print(f"Updated file for submission {submission_id}")

        # Delete existing page map since the file changed
        try:
            page_map = SubmissionPageMap.objects.get(submission=submission)
            page_map.delete()
            print(f"Deleted page map for submission {submission_id} due to file change")
        except SubmissionPageMap.DoesNotExist:
            print(f"No page map found for submission {submission_id}")

        # Return updated submission data
        serializer = SubmissionSerializer(submission)
        return Response(
            {"message": "File updated successfully", "submission": serializer.data}
        )

    except Exception as e:
        print(f"Error updating submission file: {str(e)}")
        return Response(
            {"error": f"Error updating submission file: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_question_grading_stats(request, assignment_id, question_id):
    """Get grading statistics for a specific question"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can view grading statistics"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        question = get_object_or_404(Question, id=question_id, assignment=assignment)

        # Get all submissions for this assignment
        submissions = Submission.objects.filter(assignment=assignment)
        total_submissions = submissions.count()

        # Get actual grading stats from the rubric system
        graded_submissions = SubmissionGrade.objects.filter(
            question=question, submission__in=submissions
        ).count()
        progress_percentage = (
            0
            if total_submissions == 0
            else int((graded_submissions / total_submissions) * 100)
        )

        return Response(
            {
                "question_id": question.id,
                "question_title": question.title,
                "total_submissions": total_submissions,
                "graded_submissions": graded_submissions,
                "progress_percentage": progress_percentage,
                "graded_by": request.user.name
                or f"{request.user.first_name} {request.user.last_name}".strip()
                or request.user.email,
            }
        )

    except Exception as e:
        print(f"Error getting question grading stats: {str(e)}")
        return Response(
            {"error": f"Error getting grading statistics: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_question_submissions(request, assignment_id, question_id):
    """Get all submissions for a specific question"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can view question submissions"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        question = get_object_or_404(Question, id=question_id, assignment=assignment)

        # Get all submissions for this assignment, ordered by ID to match grading data
        submissions = (
            Submission.objects.filter(assignment=assignment)
            .select_related("student", "uploaded_by")
            .order_by("id")
        )

        # Get actual submission grades from the rubric system
        submissions_data = []
        for i, submission in enumerate(submissions, 1):
            # Query the SubmissionGrade model to get actual calculated scores
            try:
                submission_grade = SubmissionGrade.objects.get(
                    submission=submission, question=question
                )
                is_graded = True
                score = float(submission_grade.total_points)
                graded_by = "سیستم نمره‌دهی"  # Since it's calculated automatically
            except SubmissionGrade.DoesNotExist:
                is_graded = False
                score = None
                graded_by = None

            # Get student name using the same logic as the serializer
            student_name = "Unassigned"
            if submission.student:
                if submission.student.name:
                    student_name = submission.student.name
                elif submission.student.first_name or submission.student.last_name:
                    student_name = f"{submission.student.first_name or ''} {submission.student.last_name or ''}".strip()
                else:
                    student_name = submission.student.email

            submissions_data.append(
                {
                    "id": submission.id,
                    "submission_id": submission.id,
                    "row_number": i,  # Add row number to match the order
                    "student_name": student_name,
                    "graded_by": graded_by,
                    "score": score,
                    "is_graded": is_graded,
                    "graded_at": None,
                }
            )

        return Response(
            {
                "question_id": question.id,
                "question_title": question.title,
                "submissions": submissions_data,
            }
        )

    except Exception as e:
        print(f"Error getting question submissions: {str(e)}")
        return Response(
            {"error": f"Error getting question submissions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_submission_grading_data(request, assignment_id, question_id, submission_id):
    """Get grading data for a specific submission"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can view grading data"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        question = get_object_or_404(Question, id=question_id, assignment=assignment)
        submission = get_object_or_404(
            Submission, id=submission_id, assignment=assignment
        )

        # Get all submissions for this question to calculate position
        all_submissions = Submission.objects.filter(assignment=assignment).order_by(
            "id"
        )
        submission_ids = list(all_submissions.values_list("id", flat=True))
        current_index = submission_ids.index(submission.id)

        # Get previous and next submission IDs
        previous_submission_id = None
        next_submission_id = None

        if current_index > 0:
            previous_submission_id = submission_ids[current_index - 1]
        if current_index < len(submission_ids) - 1:
            next_submission_id = submission_ids[current_index + 1]

        # Get student name using the same logic as the serializer
        student_name = "Unassigned"
        if submission.student:
            if submission.student.name:
                student_name = submission.student.name
            elif submission.student.first_name or submission.student.last_name:
                student_name = f"{submission.student.first_name or ''} {submission.student.last_name or ''}".strip()
            else:
                student_name = submission.student.email

        # Get page number for this question (from page map if exists)
        page_number = 1  # Default
        try:
            page_map = SubmissionPageMap.objects.get(submission=submission)
            print(f"Found page map for submission {submission_id}: {page_map.page_map}")
            if hasattr(page_map, "page_map") and page_map.page_map:
                # Find the page for this question
                # page_map.page_map is a dict like {question_id: [page_numbers]}
                if str(question_id) in page_map.page_map:
                    pages = page_map.page_map[str(question_id)]
                    print(f"Found pages for question {question_id}: {pages}")
                    if pages and len(pages) > 0:
                        page_number = pages[0]  # Use the first page for this question
                        print(f"Using page number: {page_number}")
                else:
                    print(f"Question {question_id} not found in page map")
        except SubmissionPageMap.DoesNotExist:
            print(f"No page map found for submission {submission_id}")
            pass

        # Get grading statistics
        total_submissions = all_submissions.count()
        graded_submissions = (
            0  # This would be: Grade.objects.filter(question=question).count()
        )
        progress_percentage = (
            0
            if total_submissions == 0
            else int((graded_submissions / total_submissions) * 100)
        )

        return Response(
            {
                "submission_id": submission.id,
                "student_name": student_name,
                "question_id": question.id,
                "question_title": question.title,
                "question_points": float(question.max_points),
                "total_submissions": total_submissions,
                "graded_submissions": graded_submissions,
                "progress_percentage": progress_percentage,
                "current_submission_index": current_index,
                "total_submissions_for_question": total_submissions,
                "page_number": page_number,
                "file_url": submission.file.url if submission.file else None,
                "previous_submission_id": previous_submission_id,
                "next_submission_id": next_submission_id,
            }
        )

    except Exception as e:
        print(f"Error getting submission grading data: {str(e)}")
        return Response(
            {"error": f"Error getting grading data: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Question management views
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_questions(request, assignment_id):
    """Create questions for an assignment"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can create questions"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        questions_data = request.data.get("questions", [])

        if not questions_data:
            return Response(
                {"error": "No questions provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        created_questions = []

        for i, question_data in enumerate(questions_data):
            question = Question.objects.create(
                assignment=assignment,
                title=question_data.get("title", ""),
                max_points=question_data.get(
                    "max_points", 10
                ),  # Fixed: use max_points instead of points
                number=i + 1,
                order_index=i,
                default_page_numbers=question_data.get("default_page_numbers", []),
            )
            created_questions.append(question)

        # Serialize and return
        serializer = QuestionSerializer(created_questions, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {"error": f"Error creating questions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_questions(request, assignment_id):
    """Update questions for an assignment"""
    if not request.user.is_instructor:
        return Response(
            {"error": "Only instructors can update questions"},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        questions_data = request.data.get("questions", [])

        print(f"Updating questions for assignment {assignment_id}")
        print(f"Received questions data: {questions_data}")

        # Delete existing questions
        existing_count = Question.objects.filter(assignment=assignment).count()
        print(f"Deleting {existing_count} existing questions")
        Question.objects.filter(assignment=assignment).delete()

        # Create new questions
        created_questions = []

        for i, question_data in enumerate(questions_data):
            print(f"Creating question {i+1}: {question_data}")

            # Ensure max_points is a valid decimal
            max_points = question_data.get("max_points", 10)
            if isinstance(max_points, str):
                max_points = float(max_points)

            question = Question.objects.create(
                assignment=assignment,
                title=question_data.get("title", ""),
                max_points=max_points,
                number=i + 1,
                order_index=i,
                default_page_numbers=question_data.get("default_page_numbers", []),
            )
            created_questions.append(question)
            print(
                f"Created question with ID: {question.id}, max_points: {question.max_points}"
            )

        print(f"Successfully created {len(created_questions)} questions")

        # Serialize and return
        serializer = QuestionSerializer(created_questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error updating questions: {str(e)}")
        return Response(
            {"error": f"Error updating questions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_questions(request, assignment_id):
    """Get questions for an assignment"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)
        questions = Question.objects.filter(assignment=assignment).order_by(
            "order_index"
        )

        print(f"Fetching questions for assignment {assignment_id}")
        print(f"Found {questions.count()} questions")
        for q in questions:
            print(
                f"Question: {q.title}, Points: {q.max_points}, Pages: {q.default_page_numbers}"
            )

        serializer = QuestionSerializer(questions, many=True)
        print(f"Serialized data: {serializer.data}")
        return Response(serializer.data)

    except Exception as e:
        print(f"Error fetching questions: {str(e)}")
        return Response(
            {"error": f"Error fetching questions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Rubric Items Management Endpoints
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_rubric_items(request, assignment_id, question_id):
    """Get rubric items for a question"""
    try:
        question = get_object_or_404(Question, id=question_id)
        rubric_items = RubricItem.objects.filter(question=question).order_by(
            "order_index"
        )

        serializer = RubricItemSerializer(rubric_items, many=True)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {"error": f"Error fetching rubric items: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_rubric_item(request, assignment_id, question_id):
    """Create a new rubric item for a question"""
    try:
        print(f"Creating rubric item for question {question_id}")
        print(f"Request data: {request.data}")
        print(f"Request content type: {request.content_type}")
        print(f"Request method: {request.method}")
        print(f"Request headers: {dict(request.headers)}")

        # Check if request data is empty
        if not request.data:
            print("Request data is empty!")
            return Response(
                {"error": "No data provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        question = get_object_or_404(Question, id=question_id)

        # Check if user is instructor
        if not request.user.is_instructor:
            return Response(
                {"error": "Only instructors can create rubric items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get the next order index
        max_order = (
            RubricItem.objects.filter(question=question).aggregate(
                max_order=models.Max("order_index")
            )["max_order"]
            or 0
        )
        next_order = max_order + 1

        # Create the rubric item
        rubric_item_data = {
            "question": question.id,
            "label": request.data.get("label", ""),
            "delta_points": request.data.get("delta_points", 0),
            "order_index": request.data.get("order_index", next_order),
            "is_positive": request.data.get("is_positive", True),
        }

        print(f"Rubric item data: {rubric_item_data}")

        serializer = RubricItemSerializer(data=rubric_item_data)
        if serializer.is_valid():
            rubric_item = serializer.save()
            print(f"Created rubric item: {rubric_item}")
            return Response(
                RubricItemSerializer(rubric_item).data, status=status.HTTP_201_CREATED
            )
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {"error": f"Error creating rubric item: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_rubric_item(request, assignment_id, rubric_item_id):
    """Update a rubric item"""
    try:
        rubric_item = get_object_or_404(RubricItem, id=rubric_item_id)

        # Check if user is instructor
        if not request.user.is_instructor:
            return Response(
                {"error": "Only instructors can update rubric items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RubricItemSerializer(rubric_item, data=request.data, partial=True)
        if serializer.is_valid():
            rubric_item = serializer.save()
            return Response(
                RubricItemSerializer(rubric_item).data, status=status.HTTP_200_OK
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response(
            {"error": f"Error updating rubric item: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_rubric_item(request, assignment_id, rubric_item_id):
    """Delete a rubric item"""
    try:
        rubric_item = get_object_or_404(RubricItem, id=rubric_item_id)

        # Check if user is instructor
        if not request.user.is_instructor:
            return Response(
                {"error": "Only instructors can delete rubric items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        rubric_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    except Exception as e:
        return Response(
            {"error": f"Error deleting rubric item: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_rubric_items(request, question_id):
    """Replace the full set of rubric items for a question"""
    try:
        question = get_object_or_404(Question, id=question_id)

        # Check if user is instructor
        if not request.user.is_instructor:
            return Response(
                {"error": "Only instructors can manage rubric items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        rubric_items_data = request.data

        # Validate the data
        if not isinstance(rubric_items_data, list):
            return Response(
                {"error": "Rubric items must be provided as a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Delete existing rubric items
        RubricItem.objects.filter(question=question).delete()

        # Create new rubric items
        created_items = []
        for i, item_data in enumerate(rubric_items_data):
            # Validate required fields
            if not item_data.get("label"):
                return Response(
                    {"error": f"Rubric item {i+1} must have a label"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate points_delta
            points_delta = item_data.get("points_delta", 0)
            if not isinstance(points_delta, (int, float)):
                return Response(
                    {"error": f"Rubric item {i+1} points_delta must be a number"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            rubric_item = RubricItem.objects.create(
                question=question,
                label=item_data["label"],
                description=item_data.get("description", ""),
                points_delta=points_delta,
                order_index=item_data.get("order_index", i),
                is_active=item_data.get("is_active", True),
            )
            created_items.append(rubric_item)

        # Serialize and return
        serializer = RubricItemSerializer(created_items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error updating rubric items: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# Submission Grading Endpoints
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_submission_grade(request, assignment_id, submission_id, question_id):
    """Get current grade state for a submission and question"""
    try:
        submission = get_object_or_404(Submission, id=submission_id)
        question = get_object_or_404(Question, id=question_id)

        # Get or create the submission grade
        submission_grade, created = SubmissionGrade.objects.get_or_create(
            submission=submission,
            question=question,
            defaults={"total_points": question.max_points},
        )

        serializer = SubmissionGradeSerializer(submission_grade)
        return Response(serializer.data)

    except Exception as e:
        return Response(
            {"error": f"Error fetching submission grade: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_submission_grade(request, assignment_id, submission_id, question_id):
    """Update selected rubric items for a submission and question"""
    try:
        submission = get_object_or_404(Submission, id=submission_id)
        question = get_object_or_404(Question, id=question_id)

        # Get or create the submission grade
        submission_grade, created = SubmissionGrade.objects.get_or_create(
            submission=submission,
            question=question,
            defaults={"total_points": question.max_points},
        )

        # Get selected item IDs from request
        selected_item_ids = request.data.get("selected_item_ids", [])

        if not isinstance(selected_item_ids, list):
            return Response(
                {"error": "selected_item_ids must be a list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate that all selected items belong to the question and are active
        valid_items = question.rubric_items.filter(
            id__in=selected_item_ids, is_active=True
        )

        if len(valid_items) != len(selected_item_ids):
            return Response(
                {"error": "Some selected items are invalid or inactive"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update the selected items
        submission_grade.selected_items.set(valid_items)

        # Save to trigger total_points recalculation
        submission_grade.save()

        # Return updated grade
        serializer = SubmissionGradeSerializer(submission_grade)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Error updating submission grade: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_grade_statistics(request, assignment_id):
    """Get grade statistics for an assignment"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)

        # Only allow instructors to view grade statistics
        if not request.user.is_instructor:
            return Response(
                {"error": "Only instructors can view grade statistics"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get all submissions for this assignment
        submissions = Submission.objects.filter(assignment=assignment)

        # Get all grades for these submissions
        grades = SubmissionGrade.objects.filter(
            submission__in=submissions
        ).select_related("submission")

        if not grades.exists():
            return Response(
                {
                    "minimum": 0,
                    "median": 0,
                    "maximum": 0,
                    "mean": 0,
                    "std_dev": 0,
                    "total_students": submissions.count(),
                    "graded_students": 0,
                }
            )

        # Calculate statistics
        total_scores = [
            grade.total_points for grade in grades if grade.total_points is not None
        ]

        if not total_scores:
            return Response(
                {
                    "minimum": 0,
                    "median": 0,
                    "maximum": 0,
                    "mean": 0,
                    "std_dev": 0,
                    "total_students": submissions.count(),
                    "graded_students": 0,
                }
            )

        import statistics

        stats = {
            "minimum": min(total_scores),
            "maximum": max(total_scores),
            "mean": round(statistics.mean(total_scores), 2),
            "median": round(statistics.median(total_scores), 2),
            "std_dev": round(
                statistics.stdev(total_scores) if len(total_scores) > 1 else 0, 2
            ),
            "total_students": submissions.count(),
            "graded_students": len(total_scores),
        }

        return Response(stats)

    except Exception as e:
        return Response(
            {"error": f"Error fetching grade statistics: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_student_grades(request, assignment_id):
    """Get student grades for an assignment"""
    try:
        assignment = get_object_or_404(Assignment, id=assignment_id)

        # Only allow instructors to view student grades
        if not request.user.is_instructor:
            return Response(
                {"error": "Only instructors can view student grades"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get all submissions for this assignment
        submissions = Submission.objects.filter(assignment=assignment).select_related(
            "student"
        )

        student_grades = []
        for submission in submissions:
            # Get the total grade for this submission
            grades = SubmissionGrade.objects.filter(submission=submission)
            total_score = sum(
                grade.total_points for grade in grades if grade.total_points is not None
            )
            max_score = assignment.total_points or 0

            # Check if submission is graded (has any grades)
            is_graded = grades.exists()

            student_grades.append(
                {
                    "id": submission.id,
                    "student_name": f"{submission.student.first_name or ''} {submission.student.last_name or ''}".strip()
                    or submission.student.email,
                    "email": submission.student.email,
                    "total_score": total_score,
                    "max_score": max_score,
                    "is_graded": is_graded,
                    "is_viewed": False,  # This would need to be tracked separately
                    "graded_at": (
                        submission.created_at.isoformat() if is_graded else None
                    ),
                    "grades": [
                        {
                            "question_id": grade.question.id,
                            "question_title": grade.question.title,
                            "points": grade.total_points or 0,
                            "max_points": grade.question.max_points,
                        }
                        for grade in grades
                    ],
                }
            )

        return Response({"grades": student_grades})

    except Exception as e:
        return Response(
            {"error": f"Error fetching student grades: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
