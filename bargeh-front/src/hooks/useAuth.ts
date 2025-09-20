import { useState, useCallback, useEffect } from 'react';
import { type LoginRequest, type StudentSignupRequest, type UserProfile, authService } from '@/services/authService';

interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  studentSignup: (userData: StudentSignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = authService.isAuthenticated();

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userData = await authService.getMe();
        setUser(userData as UserProfile);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
        // Clear invalid tokens
        await authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [isAuthenticated]);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const studentSignup = useCallback(async (userData: StudentSignupRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.studentSignup(userData);
      // After successful signup, user needs to login
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, clear local state
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      const updatedProfile = await authService.updateProfile(profileData);
      setUser(updatedProfile);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || 'Profile update failed';
      setError(errorMessage);
      throw err;
    }
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
    studentSignup,
    logout,
    updateProfile,
    clearError,
  };
};
