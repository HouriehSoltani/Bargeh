import React, { useState, useCallback, useEffect } from 'react';
import { type LoginRequest, type RegisterRequest, type UserProfile } from '@/services/authService';
import { userService } from '@/services/userService';

interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  // Default mock user data
  const defaultUser: UserProfile = {
    id: 1,
    email: "demo@example.com",
    name: "کاربر نمونه",
    first_name: "کاربر",
    last_name: "نمونه",
    bio: "این یک کاربر نمونه است",
    date_joined: "2024-01-01T00:00:00Z",
    last_login: "2024-01-01T00:00:00Z"
  };

  // Load user data from localStorage or use default
  const loadUserFromStorage = (): UserProfile => {
    try {
      const storedUser = localStorage.getItem('mock_user_profile');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    return defaultUser;
  };

  // AUTHENTICATION DISABLED - No authentication required
  const [user, setUser] = useState<UserProfile | null>(loadUserFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always return authenticated (no auth required)
  const isAuthenticated = true;

  // Clear any existing tokens
  React.useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  // Load user profile on mount - BYPASSED FOR DEVELOPMENT
  // useEffect(() => {
  //   const loadUserProfile = async () => {
  //     if (!isAuthenticated) {
  //       setIsLoading(false);
  //       return;
  //     }

  //     try {
  //       setIsLoading(true);
  //       const profile = await authService.getProfile();
  //       setUser(profile);
  //     } catch (err) {
  //       console.error('Failed to load user profile:', err);
  //       setError('Failed to load user profile');
  //       // Clear invalid tokens
  //       authService.logout();
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadUserProfile();
  // }, [isAuthenticated]);

  const login = useCallback(async (_credentials: LoginRequest) => {
    // BYPASSED FOR DEVELOPMENT - just return success
    return Promise.resolve();
  }, []);

  const register = useCallback(async (_userData: RegisterRequest) => {
    // BYPASSED FOR DEVELOPMENT - just return success
    return Promise.resolve();
  }, []);

  const logout = useCallback(async () => {
    // BYPASSED FOR DEVELOPMENT - just log
    return Promise.resolve();
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    // In development mode, update the mock user data in localStorage
    try {
      const currentUser = user || defaultUser;
      const updatedUser = { ...currentUser, ...profileData };
      
      // Save to localStorage
      localStorage.setItem('mock_user_profile', JSON.stringify(updatedUser));
      
      // Update the state
      setUser(updatedUser);
      
      console.log('Profile updated in localStorage:', updatedUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user, defaultUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };
};
