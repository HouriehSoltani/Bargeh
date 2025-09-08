// API Configuration
export const API_CONFIG = {
  // Base URL for your Django backend
  // In development, use relative path to leverage Vite proxy
  // In production, use full URL
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000'),
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/api/auth/login/',
    LOGOUT: '/api/auth/logout/',
    REGISTER: '/api/auth/register/',
    REFRESH: '/api/auth/refresh/',
    PROFILE: '/api/auth/profile/',
    
    // Courses
    COURSES: '/api/courses/',
    COURSE_DETAIL: (id: number) => `/api/courses/${id}/`,
    ENROLL_COURSE: '/api/courses/enroll/',
    CREATE_COURSE: '/api/courses/create/',
    
    // Assignments
    ASSIGNMENTS: (courseId: number) => `/api/courses/${courseId}/assignments/`,
    ASSIGNMENT_DETAIL: (courseId: number, assignmentId: number) => 
      `/api/courses/${courseId}/assignments/${assignmentId}/`,
    
    // Roster
    ROSTER: (courseId: number) => `/api/courses/${courseId}/roster/`,
    
    // Settings
    COURSE_SETTINGS: (courseId: number) => `/api/courses/${courseId}/settings/`,
  },
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Environment variables for different environments
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:8000',
  },
  production: {
    API_BASE_URL: 'https://your-django-backend.com',
  },
  staging: {
    API_BASE_URL: 'https://staging-your-django-backend.com',
  }
};
