import { useState, useEffect } from 'react';
import { assignmentService } from '@/services/assignmentService';
import type { Assignment } from '@/types/assignment';

export const useAssignment = (assignmentId: string | undefined) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentId) {
      setIsLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await assignmentService.getAssignment(parseInt(assignmentId));
        setAssignment(data);
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError('خطا در بارگذاری اطلاعات تکلیف');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  return { assignment, isLoading, error };
};


