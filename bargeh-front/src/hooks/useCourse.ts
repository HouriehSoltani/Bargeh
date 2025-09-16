import { useState, useEffect } from 'react';
import { courseService } from '@/services/courseService';
import type { CourseResponse } from '@/services/courseService';

interface UseCourseReturn {
  course: CourseResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCourse = (courseId: string | undefined): UseCourseReturn => {
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) {
      setError('Course ID is required');
      return;
    }

    const numericCourseId = parseInt(courseId);
    if (isNaN(numericCourseId)) {
      setError('Invalid course ID');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const courseData = await courseService.getCourse(numericCourseId);
      setCourse(courseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  return {
    course,
    isLoading,
    error,
    refetch: fetchCourse,
  };
};
