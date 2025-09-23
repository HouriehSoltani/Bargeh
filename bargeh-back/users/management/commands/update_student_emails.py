from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courses.models import Course, CourseMembership

User = get_user_model()


class Command(BaseCommand):
    help = "Update existing student emails to English transliteration"

    def add_arguments(self, parser):
        parser.add_argument(
            "--course-code",
            type=str,
            default="CS389",
            help="Course code to update students for (default: CS389)",
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

        # Get all students in the course
        students = CourseMembership.objects.filter(
            course=course, role=CourseMembership.Role.STUDENT
        )

        updated_count = 0
        for membership in students:
            user = membership.user
            if user.name and "@student.university.ac.ir" in user.email:
                # Parse the current email to extract name parts
                email_parts = user.email.split("@")[0]
                if "." in email_parts:
                    name_parts = email_parts.split(".")
                    if len(name_parts) >= 2:
                        # Extract the number at the end
                        last_part = name_parts[-1]
                        number = ""
                        name_part = last_part
                        for i, char in enumerate(reversed(last_part)):
                            if char.isdigit():
                                number = char + number
                            else:
                                name_part = last_part[: len(last_part) - i]
                                break

                        # Convert Persian name to English
                        name_parts_english = []
                        for part in name_parts[:-1]:
                            name_parts_english.append(self.transliterate_persian(part))
                        name_parts_english.append(self.transliterate_persian(name_part))

                        # Create new email
                        new_email = (
                            ".".join(name_parts_english)
                            + number
                            + "@student.university.ac.ir"
                        )

                        # Check if new email already exists
                        if (
                            not User.objects.filter(email=new_email)
                            .exclude(id=user.id)
                            .exists()
                        ):
                            old_email = user.email
                            user.email = new_email
                            user.save()
                            updated_count += 1
                            self.stdout.write(
                                self.style.SUCCESS(
                                    f"Updated {user.name}: {old_email} → {new_email}"
                                )
                            )
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f"Email {new_email} already exists for {user.name}, skipping..."
                                )
                            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully updated {updated_count} student emails for course {course_code}"
            )
        )
