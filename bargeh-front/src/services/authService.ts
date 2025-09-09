import { api } from './api';
import { API_CONFIG } from '@/config/api';

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string;
}

// Authentication service methods
export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(API_CONFIG.ENDPOINTS.LOGIN, credentials);
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    
    return response;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<{ id: number; email: string; name: string }> => {
    const response = await api.post<{ id: number; email: string; name: string }>(API_CONFIG.ENDPOINTS.REGISTER, userData);
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await api.post(API_CONFIG.ENDPOINTS.LOGOUT, {
          refresh: refreshToken
        });
      }
    } catch {
      // Even if logout fails on server, clear local tokens
      console.warn('Logout request failed, but clearing local tokens');
    } finally {
      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },

  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return api.get<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE);
  },

  // Get current user info
  getMe: async (): Promise<{ id: number; email: string; name: string }> => {
    return api.get<{ id: number; email: string; name: string }>(API_CONFIG.ENDPOINTS.ME);
  },

  // Update user profile
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    return api.patch<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE, profileData);
  },

  // Refresh access token
  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ access: string }>(API_CONFIG.ENDPOINTS.REFRESH, {
      refresh: refreshToken
    });

    localStorage.setItem('access_token', response.access);
    return response;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // Get current access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },

  // Get current refresh token
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },
};
