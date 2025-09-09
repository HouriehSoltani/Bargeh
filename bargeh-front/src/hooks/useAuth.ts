import { useState, useCallback } from 'react';
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
  // AUTHENTICATION BYPASSED FOR DEVELOPMENT
  const [user] = useState<UserProfile | null>({
    id: 1,
    email: "dev@example.com",
    name: "Development User",
    first_name: "Dev",
    last_name: "User",
    date_joined: new Date().toISOString(),
    last_login: new Date().toISOString(),
  });
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always return authenticated for development
  const isAuthenticated = true;

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

  const login = useCallback(async (credentials: LoginRequest) => {
    // BYPASSED FOR DEVELOPMENT - just return success
    console.log('Login bypassed for development:', credentials);
    return Promise.resolve();
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    // BYPASSED FOR DEVELOPMENT - just return success
    console.log('Register bypassed for development:', userData);
    return Promise.resolve();
  }, []);

  const logout = useCallback(async () => {
    // BYPASSED FOR DEVELOPMENT - just log
    console.log('Logout bypassed for development');
    return Promise.resolve();
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    // BYPASSED FOR DEVELOPMENT - just log
    console.log('Update profile bypassed for development:', profileData);
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
