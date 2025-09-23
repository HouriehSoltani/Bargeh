from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course, CourseMembership
import random

User = get_user_model()


class Command(BaseCommand):
    help = "Create 10 students with Persian names for CS389 course"

    def add_arguments(self, parser):
        parser.add_argument(
            "--course-code",
            type=str,
            default="CS389",
            help="Course code to add students to (default: CS389)",
        )

    def transliterate_persian(self, persian_text):
        """Convert Persian text to English transliteration"""
        persian_to_english = {
            "علی": "ali",
            "محمد": "mohammad",
            "حسن": "hasan",
            "حسین": "hossein",
            "رضا": "reza",
            "امیر": "amir",
            "سعید": "saeed",
            "مهدی": "mahdi",
            "احمد": "ahmad",
            "عبدالله": "abdullah",
            "فاطمه": "fatemeh",
            "زهرا": "zahra",
            "مریم": "maryam",
            "نرگس": "narges",
            "سارا": "sara",
            "نازنین": "nazanin",
            "آرزو": "arezu",
            "شیدا": "shida",
            "نیلوفر": "niloofar",
            "پریسا": "parisa",
            "احمدی": "ahmadi",
            "محمدی": "mohammadi",
            "حسینی": "hoseini",
            "رضایی": "rezaei",
            "کریمی": "karimi",
            "نوری": "nouri",
            "صادقی": "sadeghi",
            "موسوی": "mousavi",
            "جعفری": "jafari",
            "حیدری": "heidari",
            "کاظمی": "kazemi",
            "باقری": "bagheri",
            "طاهری": "taheri",
            "نظری": "nazari",
            "قاسمی": "ghasemi",
            "مرادی": "moradi",
            "اکبری": "akbari",
            "رحمانی": "rahmani",
            "فرهادی": "farhadi",
            "میرزایی": "mirzaei",
        }
        return persian_to_english.get(persian_text, persian_text)

    def handle(self, *args, **options):
        course_code = options["course_code"]

        # Persian first names
        persian_first_names = [
            "علی",
            "محمد",
            "حسن",
            "حسین",
            "رضا",
            "امیر",
            "سعید",
            "مهدی",
            "احمد",
            "عبدالله",
            "فاطمه",
            "زهرا",
            "مریم",
            "نرگس",
            "سارا",
            "نازنین",
            "آرزو",
            "شیدا",
            "نیلوفر",
            "پریسا",
        ]

        # Persian last names
        persian_last_names = [
            "احمدی",
            "محمدی",
            "حسینی",
            "رضایی",
            "کریمی",
            "نوری",
            "صادقی",
            "موسوی",
            "جعفری",
            "حیدری",
            "کاظمی",
            "باقری",
            "طاهری",
            "نظری",
            "قاسمی",
            "مرادی",
            "اکبری",
            "رحمانی",
            "فرهادی",
            "میرزایی",
        ]

        # Try to find the course
        try:
            course = Course.objects.get(code=course_code)
            self.stdout.write(
                self.style.SUCCESS(f"Found course: {course.title} ({course.code})")
            )
        except Course.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Course with code "{course_code}" not found!')
            )
            return

        # Create 10 students
        created_count = 0
        for i in range(10):
            # Generate random Persian name
            first_name = random.choice(persian_first_names)
            last_name = random.choice(persian_last_names)
            full_name = f"{first_name} {last_name}"

            # Generate email (convert Persian names to English transliteration)
            first_name_en = self.transliterate_persian(first_name)
            last_name_en = self.transliterate_persian(last_name)
            email = f"{first_name_en.lower()}.{last_name_en.lower()}{i+1}@student.university.ac.ir"

            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"Student {full_name} already exists, skipping..."
                    )
                )
                continue

            # Create user
            try:
                user = User.objects.create_user(
                    email=email,
                    password="student123",  # Default password
                    name=full_name,
                    is_instructor=False,
                )

                # Add to course as student
                CourseMembership.objects.create(
                    user=user, course=course, role=CourseMembership.Role.STUDENT
                )

                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"Created student: {full_name} ({email})")
                )

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"Error creating student {full_name}: {str(e)}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully created {created_count} students for course {course_code}"
            )
        )
