import { useState, useEffect } from 'react';
import { courseService, type CourseMembership } from '@/services/courseService';

export const useRoster = (courseId?: string) => {
  const [roster, setRoster] = useState<CourseMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoster = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await courseService.getRoster(parseInt(courseId));
      setRoster(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری لیست دانشجویان');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [courseId]);

  return {
    roster,
    isLoading,
    error,
    refetch: fetchRoster
  };
};
