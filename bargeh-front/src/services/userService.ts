import { api } from './api';
import { API_CONFIG } from '@/config/api';

// Types for user profile
export interface UserProfile {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  date_joined: string;
  last_login?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
}

// User service methods
export const userService = {
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    return api.get<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE);
  },

  // Update user profile
  updateProfile: async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    return api.patch<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE, profileData);
  },
};
