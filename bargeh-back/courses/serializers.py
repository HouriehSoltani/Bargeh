from rest_framework import serializers
from .models import Course, CourseMembership
from users.serializers import UserProfileSerializer


class CourseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "title", "code", "description", "term", "year", "created_at"]
        extra_kwargs = {
            "code": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "term": {"required": False},
            "year": {"required": False, "min_value": 1402, "max_value": 1406},
        }

    def create(self, validated_data):
        import uuid

        # Set the owner to the authenticated user
        user = self.context["request"].user
        validated_data["owner"] = user

        # Generate a unique invite code if not provided
        if "invite_code" not in validated_data:
            while True:
                invite_code = str(uuid.uuid4())[:8].upper()
                if not Course.objects.filter(invite_code=invite_code).exists():
                    validated_data["invite_code"] = invite_code
                    break

        # Create the course
        course = Course.objects.create(**validated_data)

        # Create CourseMembership for the user
        # Admin users and course creators become instructors
        if user.is_superuser or user.is_staff:
            role = CourseMembership.Role.INSTRUCTOR
        else:
            # Course creators are always instructors of their courses
            role = CourseMembership.Role.INSTRUCTOR

        CourseMembership.objects.create(user=user, course=course, role=role)

        return course


class CourseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["title", "code", "description", "term", "year"]
        extra_kwargs = {
            "title": {"required": False},
            "code": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "term": {"required": False},
            "year": {"required": False, "min_value": 1402, "max_value": 1406},
        }

    def validate_title(self, value):
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("نام درس باید حداقل 2 کاراکتر باشد")
        return value.strip() if value else value

    def validate_code(self, value):
        if value and len(value.strip()) < 2:
            raise serializers.ValidationError("کد درس باید حداقل 2 کاراکتر باشد")
        return value.strip() if value else value

    def validate_year(self, value):
        if value and (value < 1400 or value > 1410):
            raise serializers.ValidationError("سال باید بین 1400 تا 1410 باشد")
        return value


class CourseSerializer(serializers.ModelSerializer):
    instructor_detail = UserProfileSerializer(source="owner", read_only=True)
    enrolled_students_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()  # User's role in this course

    # Frontend-compatible fields
    courseCode = serializers.CharField(source="code", read_only=True)
    instructor = serializers.SerializerMethodField()  # String format for frontend
    students = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    enrolled = serializers.SerializerMethodField()
    assignments = serializers.SerializerMethodField()
    term = serializers.SerializerMethodField()
    year = serializers.IntegerField(read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ("instructor", "created_at", "invite_code")

    def get_enrolled_students_count(self, obj):
        return obj.memberships.filter(role=CourseMembership.Role.STUDENT).count()

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user).exists()
        return False

    def get_user_role(self, obj):
        """Get the user's role in this course"""
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            membership = obj.memberships.filter(user=request.user).first()
            if membership:
                return membership.role
        return None

    def get_instructor(self, obj):
        if obj.owner:
            return obj.owner.name or obj.owner.email
        return "Unknown Instructor"

    def get_students(self, obj):
        return obj.memberships.filter(role=CourseMembership.Role.STUDENT).count()

    def get_rating(self, obj):
        return 4.5  # Default rating

    def get_progress(self, obj):
        return 0  # Default progress

    def get_category(self, obj):
        return "General"  # Default category

    def get_level(self, obj):
        return "Undergraduate"  # Default level

    def get_image(self, obj):
        return "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop"  # Default image

    def get_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.memberships.filter(user=request.user).exists()
        return False

    def get_assignments(self, obj):
        return obj.assignments.count()  # Actual assignments count

    def get_term(self, obj):
        return obj.term  # Return the raw value (spring, summer, etc.)

    def get_duration(self, obj):
        return f"{obj.get_term_display()} {obj.year}"  # e.g., "بهار 1403"

    def create(self, validated_data):
        import uuid

        # Set the owner to the authenticated user
        validated_data["owner"] = self.context["request"].user

        # Generate a unique invite code if not provided
        if "invite_code" not in validated_data:
            while True:
                invite_code = str(uuid.uuid4())[:8].upper()
                if not Course.objects.filter(invite_code=invite_code).exists():
                    validated_data["invite_code"] = invite_code
                    break

        # Create the course
        course = Course.objects.create(**validated_data)
        return course


class CourseMembershipSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = CourseMembership
        fields = "__all__"
        read_only_fields = ("user", "created_at", "submission_count")

    def get_submission_count(self, obj):
        """Get the number of submissions made by this user in this course"""
        if obj.role != CourseMembership.Role.STUDENT:
            return 0

        from assignments.models import Submission

        return Submission.objects.filter(
            assignment__course=obj.course, student=obj.user
        ).count()


class EnrollByCodeSerializer(serializers.Serializer):
    """Serializer for student enrollment via invite code"""

    invite_code = serializers.CharField(max_length=16)

    def validate_invite_code(self, value):
        try:
            self.course = Course.objects.get(invite_code=value)
        except Course.DoesNotExist:
            raise serializers.ValidationError("کد دعوت نامعتبر است")
        return value

    def create(self, validated_data):
        user = self.context["request"].user

        # Check if user is already enrolled
        existing_membership = CourseMembership.objects.filter(
            user=user, course=self.course
        ).first()

        if existing_membership:
            # User is already enrolled, return the existing membership
            # The view will handle this case and provide appropriate feedback
            return existing_membership

        # Create new membership
        membership = CourseMembership.objects.create(
            user=user,
            course=self.course,
            role=CourseMembership.Role.STUDENT,
        )
        return membership


class EnrollCourseSerializer(serializers.Serializer):
    invite_code = serializers.CharField(max_length=16)

    def validate_invite_code(self, value):
        try:
            course = Course.objects.get(invite_code=value)
            return value
        except Course.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code")
