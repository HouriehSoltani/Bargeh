import { api } from './api';
import { API_CONFIG } from '@/config/api';
import type { Course } from '@/components/CourseCard';

// Types for API requests and responses
export interface CreateCourseRequest {
  title: string;
  code: string;
  description?: string;
  term?: string;
  year?: number;
}

export interface EnrollCourseRequest {
  invite_code: string;
}

export interface EnrollCourseResponse {
  message: string;
  course: CourseResponse;
  already_enrolled: boolean;
}

export interface CourseResponse extends Course {
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Course service methods
export const courseService = {
  // Get all courses for the current user
  getCourses: async (): Promise<CourseResponse[]> => {
    const response = await api.get<PaginatedResponse<CourseResponse>>(API_CONFIG.ENDPOINTS.COURSES);
    return response.results;
  },

  // Get a specific course by ID
  getCourse: async (id: number): Promise<CourseResponse> => {
    return api.get<CourseResponse>(API_CONFIG.ENDPOINTS.COURSE_DETAIL(id));
  },

  // Create a new course
  createCourse: async (courseData: CreateCourseRequest): Promise<CourseResponse> => {
    return api.post<CourseResponse>(API_CONFIG.ENDPOINTS.CREATE_COURSE, courseData);
  },

  // Enroll in a course using entry code
  enrollCourse: async (enrollData: EnrollCourseRequest): Promise<EnrollCourseResponse> => {
    return api.post<EnrollCourseResponse>(API_CONFIG.ENDPOINTS.ENROLL_BY_CODE, enrollData);
  },

  // Update course settings
  updateCourseSettings: async (courseId: number, settings: Partial<Course>): Promise<CourseResponse> => {
    return api.patch<CourseResponse>(API_CONFIG.ENDPOINTS.COURSE_SETTINGS(courseId), settings);
  },

  // Update course (alias for updateCourseSettings)
  updateCourse: async (courseId: number, courseData: Partial<CreateCourseRequest>): Promise<CourseResponse> => {
    return api.patch<CourseResponse>(API_CONFIG.ENDPOINTS.COURSE_DETAIL(courseId), courseData);
  },

  // Get course assignments
  getAssignments: async (courseId: number): Promise<unknown[]> => {
    return api.get<unknown[]>(API_CONFIG.ENDPOINTS.ASSIGNMENTS(courseId));
  },

  // Get course roster
  getRoster: async (courseId: number): Promise<unknown[]> => {
    return api.get<unknown[]>(API_CONFIG.ENDPOINTS.ROSTER(courseId));
  },

  // Delete a course (if user has permission)
  deleteCourse: async (courseId: number): Promise<void> => {
    return api.delete<void>(API_CONFIG.ENDPOINTS.COURSE_DETAIL(courseId));
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId: number): Promise<{ message: string; course: CourseResponse }> => {
    return api.delete<{ message: string; course: CourseResponse }>(`/api/courses/${courseId}/unenroll/`);
  },
};
