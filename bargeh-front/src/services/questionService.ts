import { api } from './api';

export interface Question {
  id?: number;
  title: string;
  points: number;
  order: number;
  default_page_numbers?: number[];
}

export interface QuestionCreateData {
  title: string;
  points: number;
  order: number;
  default_page_numbers?: number[];
}

export const questionService = {
  // Create questions for an assignment
  async createQuestions(assignmentId: number, questions: QuestionCreateData[]): Promise<Question[]> {
    try {
      const response = await api.post(`/api/assignments/${assignmentId}/questions/create/`, {
        questions
      });
      return (response as any).data;
    } catch (error) {
      console.error('Error creating questions:', error);
      throw new Error('Failed to create questions');
    }
  },

  // Update questions for an assignment
  async updateQuestions(assignmentId: number, questions: Question[]): Promise<Question[]> {
    try {
      const response = await api.put(`/api/assignments/${assignmentId}/questions/update/`, {
        questions
      });
      return (response as any).data;
    } catch (error: any) {
      console.error('Error updating questions:', error);
      throw new Error('Failed to update questions');
    }
  },

  // Get questions for an assignment
  async getQuestions(assignmentId: number): Promise<Question[]> {
    try {
      const response = await api.get(`/api/assignments/${assignmentId}/questions/`);
      return (response as any).data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  },

  // Delete a question
  async deleteQuestion(assignmentId: number, questionId: number): Promise<void> {
    try {
      await api.delete(`/api/assignments/${assignmentId}/questions/${questionId}/`);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw new Error('Failed to delete question');
    }
  }
};
