# Bargeh - Course Management System

A comprehensive course management system built with Django REST Framework backend and React TypeScript frontend, designed for educational institutions to manage courses, assignments, submissions, and grading.

## 🎯 Overview

Bargeh is a full-stack web application that provides a complete solution for course management, including:

- **Course Management**: Create and manage courses with enrollment codes
- **Assignment System**: Create assignments with multiple versions, questions, and rubrics
- **Submission Handling**: PDF-based assignment submissions with late tracking
- **Grading System**: Comprehensive grading with rubric-based evaluation
- **User Management**: Role-based access control (Instructors, TAs, Students)
- **Admin Dashboard**: Complete administrative interface for system management

## 🏗️ Architecture

### Backend (`bargeh-back/`)
- **Framework**: Django 5.2.5 with Django REST Framework
- **Database**: MySQL
- **Authentication**: JWT-based authentication with refresh tokens
- **File Storage**: Local media storage for PDFs and documents
- **Admin Interface**: Custom Django admin with dashboard

### Frontend (`bargeh-front/`)
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4
- **UI Library**: Chakra UI 3.23.0
- **PDF Handling**: React PDF with highlighting capabilities
- **Routing**: React Router DOM 7.7.1
- **Date Handling**: Persian calendar support with moment-jalaali

## 🚀 Features

### For Instructors
- Create and manage courses with unique enrollment codes
- Design assignments with multiple versions (A, B, C, etc.)
- Set up detailed rubrics for consistent grading
- Upload assignment templates as PDFs
- Monitor submission status and late submissions
- Grade assignments with detailed feedback
- Review and release grades to students
- Manage course roster and student enrollments

### For Students
- Join courses using enrollment codes
- View assignment details and download templates
- Submit assignments as PDF files
- Track submission status and grades
- View detailed feedback and rubric scores
- Access course materials and announcements

### For Administrators
- Comprehensive system dashboard with statistics
- User management with bulk operations
- Course oversight and management
- System-wide assignment and submission monitoring
- Grade management and reporting

## 📋 Prerequisites

- **Python**: 3.13+
- **Node.js**: 18+ 
- **MySQL**: 8.0+
- **Pipenv**: For Python dependency management
- **npm**: For Node.js dependency management

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Bargeh
```

### 2. Backend Setup

```bash
cd bargeh-back

# Install Python dependencies
pipenv install

# Activate virtual environment
pipenv shell

# Set up MySQL database
# Create database named 'bargeh' in MySQL

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start Django development server
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd bargeh-front

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Database Configuration

Update the database settings in `bargeh-back/bargeh/settings.py`:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "bargeh",
        "HOST": "localhost",
        "USER": "your_mysql_user",
        "PASSWORD": "your_mysql_password",
    }
}
```

## 📁 Project Structure

```
Bargeh/
├── bargeh-back/                 # Django backend
│   ├── assignments/            # Assignment management app
│   ├── courses/               # Course management app
│   ├── grade/                 # Grading system app
│   ├── submissions/           # Submission handling app
│   ├── users/                 # User management app
│   ├── common/                # Shared utilities
│   ├── bargeh/                # Django project settings
│   ├── media/                 # File uploads (PDFs, etc.)
│   └── templates/             # Admin templates
├── bargeh-front/              # React frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API service functions
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utility functions
│   ├── public/               # Static assets
│   └── dist/                 # Build output
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
```

### CORS Settings

The backend is configured to allow requests from:
- `http://localhost:3000`
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - User profile

### Course Endpoints
- `GET /api/courses/` - List user's courses
- `POST /api/courses/` - Create new course
- `GET /api/courses/{id}/` - Course details
- `POST /api/courses/enroll/` - Enroll in course

### Assignment Endpoints
- `GET /api/assignments/` - List assignments
- `POST /api/assignments/` - Create assignment
- `GET /api/assignments/{id}/` - Assignment details
- `POST /api/assignments/{id}/submit/` - Submit assignment

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Theme switching capability
- **Persian Language Support**: RTL layout with Persian calendar
- **PDF Viewer**: Built-in PDF viewing and annotation
- **Real-time Updates**: Live status updates for submissions
- **Accessibility**: WCAG compliant interface

## 🔒 Security Features

- JWT-based authentication with refresh token rotation
- Role-based access control (RBAC)
- CORS protection
- File upload validation
- SQL injection protection
- XSS protection

## 🧪 Testing

### Backend Testing
```bash
cd bargeh-back
python manage.py test
```

### Frontend Testing
```bash
cd bargeh-front
npm run test
```

## 📦 Deployment

### Production Settings

1. Update `DEBUG = False` in settings
2. Set up proper database credentials
3. Configure static file serving
4. Set up media file storage (AWS S3 recommended)
5. Configure proper CORS origins
6. Set up SSL certificates

### Docker Deployment (Optional)

```dockerfile
# Backend Dockerfile
FROM python:3.13
WORKDIR /app
COPY Pipfile* ./
RUN pip install pipenv && pipenv install --system
COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Houri Soltani** - *Initial work* - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- Django REST Framework for the robust API framework
- React and TypeScript for the modern frontend
- Chakra UI for the beautiful component library
- PDF.js for PDF rendering capabilities
- Persian calendar libraries for localization support

## 📞 Support

For support, email soltanihoorie@gmail.com or create an issue in the repository.

---

**Bargeh** - Empowering education through technology 🎓
