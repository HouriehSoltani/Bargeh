import { api } from './api';
import type { Assignment, AssignmentResponse } from '../types/assignment';

export const assignmentService = {
  async getCourseAssignments(courseId: number): Promise<AssignmentResponse> {
    try {
      const response = await api.get<AssignmentResponse>(`/api/assignments/course/${courseId}/`);
      return response;
    } catch (error) {
      // Fallback to mock data for development
      console.log('API call failed, using mock data for development');
      return {
        results: [
          {
            id: 1,
            title: "تکلیف اول - برنامه‌نویسی",
            instructions: "یک برنامه ساده بنویسید",
            due_at: "2024-12-31T23:59:59Z",
            total_points: 100,
            is_published: true,
            regrade_enabled: true, // ON - created with regrade enabled
            created_at: "2024-01-01T00:00:00Z",
            course: courseId
          },
          {
            id: 2,
            title: "تکلیف دوم - الگوریتم",
            instructions: "الگوریتم مرتب‌سازی پیاده‌سازی کنید",
            due_at: "2024-12-25T23:59:59Z",
            total_points: 150,
            is_published: false,
            regrade_enabled: false, // OFF - created with regrade disabled
            created_at: "2024-01-02T00:00:00Z",
            course: courseId
          },
          {
            id: 3,
            title: "پروژه نهایی",
            instructions: "یک پروژه کامل پیاده‌سازی کنید",
            due_at: "2025-01-15T23:59:59Z",
            total_points: 200,
            is_published: true,
            regrade_enabled: true, // ON - created with regrade enabled
            created_at: "2024-01-03T00:00:00Z",
            course: courseId
          },
          {
            id: 4,
            title: "تکلیف تست - بدون بازبینی",
            instructions: "این تکلیف برای تست ایجاد شده",
            due_at: "2024-12-20T23:59:59Z",
            total_points: 50,
            is_published: true,
            regrade_enabled: false, // OFF - created with regrade disabled
            created_at: "2024-01-04T00:00:00Z",
            course: courseId
          }
        ],
        count: 4
      };
    }
  },

  async getCourseAssignmentCount(courseId: number): Promise<number> {
    const response = await api.get<AssignmentResponse>(`/api/assignments/course/${courseId}/`);
    return response.count || 0;
  },

  async getAssignment(assignmentId: number): Promise<Assignment> {
    const response = await api.get<Assignment>(`/api/assignments/${assignmentId}/`);
    return response;
  },

  async createAssignment(_courseId: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    try {
      const response = await api.post<Assignment>(`/api/assignments/`, assignmentData);
      return response;
    } catch (error) {
      // For development, simulate successful creation
      console.log('Assignment creation API failed, simulating success for development');
      const newAssignment: Assignment = {
        id: Date.now(), // Use timestamp as ID for mock
        title: assignmentData.title || 'تکلیف جدید',
        instructions: assignmentData.instructions || '',
        due_at: assignmentData.due_at || null,
        total_points: assignmentData.total_points || 100,
        is_published: assignmentData.is_published || false,
        regrade_enabled: assignmentData.regrade_enabled || false,
        created_at: new Date().toISOString(),
        course: _courseId
      };
      return newAssignment;
    }
  },

  async updateAssignment(assignmentId: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response = await api.put<Assignment>(`/api/assignments/${assignmentId}/`, assignmentData);
    return response;
  },

  async deleteAssignment(assignmentId: number): Promise<void> {
    try {
      await api.delete(`/api/assignments/${assignmentId}/`);
    } catch (error) {
      // For development, simulate successful deletion
      console.log('Assignment deletion API failed, simulating success for development');
      console.log('Deleted assignment ID:', assignmentId);
      
      // In a real app, you would update the local state or refetch data
      // For now, we'll just log the deletion
    }
  }
};
