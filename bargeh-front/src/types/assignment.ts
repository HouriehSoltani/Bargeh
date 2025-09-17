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
}

export interface AssignmentResponse {
  count: number;
  results: Assignment[];
}
