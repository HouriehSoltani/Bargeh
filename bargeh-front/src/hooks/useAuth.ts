import { useState, useEffect, useCallback } from 'react';
import { authService, type LoginRequest, type RegisterRequest, type UserProfile } from '@/services/authService';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load user profile');
        // Clear invalid tokens
        authService.logout();
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
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(userData);
      setUser(response.user);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    try {
      setError(null);
      const updatedProfile = await authService.updateProfile(profileData);
      setUser(updatedProfile);
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Profile update failed';
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
    register,
    logout,
    updateProfile,
    clearError,
  };
};
