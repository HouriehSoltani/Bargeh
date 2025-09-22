export interface Assignment {
  id: number;
  title: string;
  instructions: string;
  due_at: string | null;
  total_points: number;
  is_published: boolean;
  regrade_enabled: boolean;
  created_at: string;
  course: number;
  template_pdf?: string; // URL to the PDF file
  total_submissions?: number; // Number of submissions received
  grading_progress?: number; // Percentage of grading completed
}

export interface AssignmentResponse {
  count: number;
  results: Assignment[];
}
