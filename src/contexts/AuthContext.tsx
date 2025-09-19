import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User as ApiUser } from '../services/api';

// Updated User interface to match API response
interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'admin' | 'user';
  ageGroup: 'child' | 'youth' | 'adult';
  firstName?: string;
  lastName?: string;
  preferredLanguage?: 'English' | 'Hindi';
  isEmailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData, options?: { skipAutoLogin?: boolean }) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  ageGroup: 'child' | 'youth' | 'adult';
  preferredLanguage?: 'English' | 'Hindi';
  gender?: 'Male' | 'Female' | 'Other' | string;
  dateOfBirth?: string;
  city?: string;
  state?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert API user to local user format
const convertApiUserToLocalUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.UserID,
    name: apiUser.FullName,
    email: apiUser.Email,
    mobile: apiUser.MobileNumber || '',
    role: apiUser.Role.toLowerCase() as 'admin' | 'user',
    ageGroup: apiUser.AgeGroup.toLowerCase() as 'child' | 'youth' | 'adult',
    firstName: apiUser.FirstName,
    lastName: apiUser.LastName,
    preferredLanguage: apiUser.PreferredLanguage,
    isEmailVerified: apiUser.IsEmailVerified,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from stored data on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      // Check if user is stored and token exists
      if (authService.isAuthenticated()) {
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(convertApiUserToLocalUser(storedUser));

          // Optionally refresh user data from API, but handle auth failures gracefully
          try {
            const result = await authService.getCurrentUser();
            if (result.success && result.user) {
              setUser(convertApiUserToLocalUser(result.user));
            } else {
              // If refresh fails, keep using stored user but don't clear auth
              console.warn('Failed to refresh user data, using stored user:', result.message);
            }
          } catch (error) {
            console.error('Failed to refresh user data, using stored user:', error);
          }
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authService.login(email, password);

      if (result.success && result.user) {
        const localUser = convertApiUserToLocalUser(result.user);
        setUser(localUser);
        return { success: true, message: result.message };
      }

      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData: RegisterData, options?: { skipAutoLogin?: boolean }): Promise<{ success: boolean; message: string }> => {
    try {
      const registerRequest = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        mobileNumber: userData.mobile,
  dateOfBirth: userData.dateOfBirth,
        ageGroup: userData.ageGroup.charAt(0).toUpperCase() + userData.ageGroup.slice(1) as 'Child' | 'Youth' | 'Adult',
        preferredLanguage: userData.preferredLanguage || 'English' as 'English' | 'Hindi',
  gender: userData.gender,
        city: userData.city,
        state: userData.state,
      };

      const result = await authService.register(registerRequest);

      if (result.success && result.user) {
        const localUser = convertApiUserToLocalUser(result.user);
        // Only set authenticated user when this is a normal self-registration.
        // When an admin creates a user via admin UI, caller should pass { skipAutoLogin: true }
        if (!options?.skipAutoLogin) {
          setUser(localUser);
        }
        return { success: true, message: result.message };
      }

      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success && result.user) {
        setUser(convertApiUserToLocalUser(result.user));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin,
      isLoading,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};