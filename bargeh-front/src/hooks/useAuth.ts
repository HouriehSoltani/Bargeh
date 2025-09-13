import React, { useState, useCallback } from 'react';
import { type LoginRequest, type RegisterRequest, type UserProfile } from '@/services/authService';

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
  // AUTHENTICATION DISABLED - No authentication required
  const [user] = useState<UserProfile | null>({
    id: 1,
    email: "user@example.com",
    name: "Demo User",
    first_name: "Demo",
    last_name: "User",
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  });
  const [isLoading] = useState(false);
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

  const updateProfile = useCallback(async (_profileData: Partial<UserProfile>) => {
    // BYPASSED FOR DEVELOPMENT - just log
    return Promise.resolve();
  }, []);

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
