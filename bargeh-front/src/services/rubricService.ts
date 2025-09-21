import { api } from './api';

export interface RubricItem {
  id: number;
  label: string;
  delta_points: number;
  order_index: number;
  is_positive: boolean;
}

export interface SubmissionGrade {
  id: number;
  submission: number;
  question: number;
  selected_item_ids: number[];
  total_points: number;
  updated_at: string;
}

export const rubricService = {
  // Get rubric items for a question
  async getRubricItems(assignmentId: number, questionId: number): Promise<RubricItem[]> {
    const response = await api.get(`/api/assignments/${assignmentId}/questions/${questionId}/rubric-items/`);
    return response as RubricItem[];
  },

  // Create a new rubric item
  async createRubricItem(assignmentId: number, questionId: number, rubricItem: Omit<RubricItem, 'id'>): Promise<RubricItem> {
    console.log('rubricService.createRubricItem called with:', { assignmentId, questionId, rubricItem });
    const url = `/api/assignments/${assignmentId}/questions/${questionId}/rubric-items/create/`;
    console.log('POST URL:', url);
    const response = await api.post(url, rubricItem);
    console.log('Response received:', response);
    return response as RubricItem;
  },

  // Update a rubric item
  async updateRubricItem(assignmentId: number, rubricItemId: number, rubricItem: Partial<RubricItem>): Promise<RubricItem> {
    const response = await api.put(`/api/assignments/${assignmentId}/rubric-items/${rubricItemId}/`, rubricItem);
    return response as RubricItem;
  },

  // Delete a rubric item
  async deleteRubricItem(assignmentId: number, rubricItemId: number): Promise<void> {
    await api.delete(`/api/assignments/${assignmentId}/rubric-items/${rubricItemId}/delete/`);
  },

  // Update rubric items for a question (instructor only)
  async updateRubricItems(assignmentId: number, questionId: number, rubricItems: Omit<RubricItem, 'id'>[]): Promise<RubricItem[]> {
    const response = await api.put(`/api/assignments/${assignmentId}/questions/${questionId}/rubric-items/`, rubricItems);
    return response as RubricItem[];
  },

  // Get submission grade for a specific submission and question
  async getSubmissionGrade(assignmentId: number, submissionId: number, questionId: number): Promise<SubmissionGrade> {
    const response = await api.get(`/api/assignments/${assignmentId}/submissions/${submissionId}/grades/${questionId}/`);
    return response as SubmissionGrade;
  },

  // Update submission grade (select rubric items)
  async updateSubmissionGrade(assignmentId: number, submissionId: number, questionId: number, selectedItemIds: number[]): Promise<SubmissionGrade> {
    const response = await api.put(`/api/assignments/${assignmentId}/submissions/${submissionId}/grades/${questionId}/update/`, {
      selected_item_ids: selectedItemIds
    });
    return response as SubmissionGrade;
  },
};
