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
            course: courseId,
            template_pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
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
    try {
      const response = await api.get<Assignment>(`/api/assignments/${assignmentId}/`);
      return response;
    } catch (error) {
      // Check if this is a mock assignment ID (timestamp-based)
      if (assignmentId > 1000000000000) { // Timestamp-based ID
        console.log('Assignment fetch API failed for mock assignment, using mock data for development');
        return {
          id: assignmentId,
          title: 'تکلیف برنامه نویسی',
          instructions: 'این یک تکلیف نمونه است',
          due_at: '2024-12-31T23:59:59Z',
          total_points: 100,
          is_published: false,
          regrade_enabled: true,
          created_at: new Date().toISOString(),
          course: 1,
          template_pdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        };
      } else {
        // Real assignment ID that doesn't exist
        console.error('Assignment not found:', assignmentId);
        throw new Error('Assignment not found');
      }
    }
  },

  async createAssignment(_courseId: number, assignmentData: Partial<Assignment> & { templatePdf?: File }): Promise<Assignment> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all assignment fields
      Object.entries(assignmentData).forEach(([key, value]) => {
        if (key === 'templatePdf' && value instanceof File) {
          formData.append('template_pdf', value);
        } else if (value !== null && value !== undefined) {
          // Convert camelCase to snake_case for backend
          const backendKey = key === 'totalPoints' ? 'total_points' : 
                           key === 'isPublished' ? 'is_published' :
                           key === 'regradeEnabled' ? 'regrade_enabled' :
                           key === 'dueAt' ? 'due_at' :
                           key === 'uploadByStudent' ? 'upload_by_student' :
                           key === 'anonymizedGrading' ? 'anonymized_grading' :
                           key;
          
          // Convert uploadByStudent from string to boolean
          if (key === 'uploadByStudent') {
            formData.append(backendKey, (value === 'student').toString());
          } else {
            formData.append(backendKey, value.toString());
          }
        }
      });

      const response = await api.post<Assignment>(`/api/assignments/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error: any) {
      console.error('Assignment creation failed:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // Check if it's a validation error
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.values(errorData).flat();
          throw new Error(`Validation error: ${errorMessages.join(', ')}`);
        }
        throw new Error('Invalid assignment data');
      }
      
      // For other errors, provide a generic message
      throw new Error('Failed to create assignment. Please try again.');
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
