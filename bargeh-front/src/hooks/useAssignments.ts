import { useState, useEffect, useCallback } from 'react';
import { assignmentService } from '../services/assignmentService';
import type { Assignment, AssignmentResponse } from '../types/assignment';

interface UseAssignmentsReturn {
  assignments: Assignment[];
  assignmentCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAssignments = (courseId: string | undefined): UseAssignmentsReturn => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!courseId) {
      setAssignments([]);
      setAssignmentCount(0);
      setIsLoading(false);
      setError('Course ID is undefined');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await assignmentService.getCourseAssignments(parseInt(courseId));
      setAssignments(data.results || []);
      setAssignmentCount(data.count || 0);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch assignments';
      setError(errorMessage);
      setAssignments([]);
      setAssignmentCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return { assignments, assignmentCount, isLoading, error, refetch: fetchAssignments };
};
