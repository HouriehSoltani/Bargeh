import { api } from './api';

export interface Question {
  id?: number;
  title: string;
  max_points: number; // Backend uses max_points
  order_index: number; // Backend uses order_index
  default_page_numbers?: number[];
}

export interface QuestionCreateData {
  title: string;
  max_points: number; // Backend uses max_points
  order_index: number; // Backend uses order_index
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
      console.log('Sending update request to:', `/api/assignments/${assignmentId}/questions/update/`);
      console.log('Request payload:', { questions });
      
      const response = await api.put(`/api/assignments/${assignmentId}/questions/update/`, {
        questions
      });
      
      console.log('Update response:', response);
      return response; // API service already extracts .data
    } catch (error: any) {
      console.error('Error updating questions:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(`Failed to update questions: ${error.response?.data?.error || error.message}`);
    }
  },

  // Get questions for an assignment
  async getQuestions(assignmentId: number): Promise<Question[]> {
    try {
      console.log('Fetching questions from:', `/api/assignments/${assignmentId}/questions/`);
      
      const response = await api.get(`/api/assignments/${assignmentId}/questions/`);
      
      console.log('Get questions response:', response);
      return response; // API service already extracts .data
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(`Failed to fetch questions: ${error.response?.data?.error || error.message}`);
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
