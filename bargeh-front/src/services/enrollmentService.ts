import { api } from './api';
import { API_CONFIG } from '@/config/api';

export interface EnrollByCodeRequest {
  invite_code: string;
}

export interface EnrollByCodeResponse {
  message: string;
  course: {
    id: number;
    title: string;
    code: string;
    description: string;
    invite_code: string;
    term: string;
    year: number;
    created_at: string;
  };
  already_enrolled: boolean;
}

export const enrollmentService = {
  // Enroll in course by invite code (students only)
  enrollByCode: async (data: EnrollByCodeRequest): Promise<EnrollByCodeResponse> => {
    return api.post<EnrollByCodeResponse>(API_CONFIG.ENDPOINTS.ENROLL_BY_CODE, data);
  },
};
