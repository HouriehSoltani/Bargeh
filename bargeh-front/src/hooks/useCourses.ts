import { useState, useEffect, useCallback } from 'react';
import { courseService, type CreateCourseRequest, type EnrollCourseRequest } from '@/services/courseService';
import type { Course } from '@/components/CourseCard';

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  error: string | null;
  createCourse: (courseData: CreateCourseRequest) => Promise<Course>;
  enrollCourse: (enrollData: EnrollCourseRequest) => Promise<Course>;
  updateCourse: (courseId: number, updates: Partial<Course>) => Promise<Course>;
  deleteCourse: (courseId: number) => Promise<void>;
  refreshCourses: () => Promise<void>;
  clearError: () => void;
}

export const useCourses = (): UseCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const courseData = await courseService.getCourses();
      setCourses(courseData);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to load courses';
      setError(errorMessage);
      console.error('Failed to load courses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load courses on mount
  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const createCourse = useCallback(async (courseData: CreateCourseRequest): Promise<Course> => {
    try {
      setError(null);
      const newCourse = await courseService.createCourse(courseData);
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to create course';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const enrollCourse = useCallback(async (enrollData: EnrollCourseRequest): Promise<Course> => {
    try {
      setError(null);
      const enrolledCourse = await courseService.enrollCourse(enrollData);
      setCourses(prev => [...prev, enrolledCourse]);
      return enrolledCourse;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to enroll in course';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const updateCourse = useCallback(async (courseId: number, updates: Partial<Course>): Promise<Course> => {
    try {
      setError(null);
      const updatedCourse = await courseService.updateCourseSettings(courseId, updates);
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId ? updatedCourse : course
        )
      );
      return updatedCourse;
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to update course';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: number): Promise<void> => {
    try {
      setError(null);
      await courseService.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to delete course';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    await loadCourses();
  }, [loadCourses]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    courses,
    isLoading,
    error,
    createCourse,
    enrollCourse,
    updateCourse,
    deleteCourse,
    refreshCourses,
    clearError,
  };
};
