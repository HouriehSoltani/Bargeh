import { api } from './api';
import type { Assignment, AssignmentResponse } from '../types/assignment';

export const assignmentService = {
  async getCourseAssignments(courseId: number): Promise<AssignmentResponse> {
    const response = await api.get<AssignmentResponse>(`/assignments/course/${courseId}/`);
    return response;
  },

  async getCourseAssignmentCount(courseId: number): Promise<number> {
    const response = await api.get<AssignmentResponse>(`/assignments/course/${courseId}/`);
    return response.count || 0;
  },

  async getAssignment(assignmentId: number): Promise<Assignment> {
    const response = await api.get<Assignment>(`/assignments/${assignmentId}/`);
    return response;
  },

  async createAssignment(courseId: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response = await api.post<Assignment>(`/courses/${courseId}/assignments/`, assignmentData);
    return response;
  },

  async updateAssignment(assignmentId: number, assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response = await api.put<Assignment>(`/assignments/${assignmentId}/`, assignmentData);
    return response;
  },

  async deleteAssignment(assignmentId: number): Promise<void> {
    await api.delete(`/assignments/${assignmentId}/`);
  }
};
