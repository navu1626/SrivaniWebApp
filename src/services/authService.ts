import api, { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User,
  handleApiError 
} from './api';

class AuthService {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const loginData: LoginRequest = { email, password };
      const response = await api.post<AuthResponse>('/auth/login', loginData);
      
      if (response.data.success && response.data.user && response.data.token) {
        // Store tokens and user data
        localStorage.setItem('srivani_token', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('srivani_refresh_token', response.data.refreshToken);
        }
        localStorage.setItem('srivani_user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.success && response.data.user) {
        return {
          success: true,
          user: response.data.user,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Registration failed'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate session
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('srivani_token');
      localStorage.removeItem('srivani_refresh_token');
      localStorage.removeItem('srivani_user');
    }
  }

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('srivani_user', JSON.stringify(response.data.data));
        
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to get user data'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse>('/auth/forgot-password', { email });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse>('/auth/reset-password', {
        token,
        password
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.get<ApiResponse>(`/auth/verify-email/${token}`);
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<ApiResponse>('/auth/resend-verification');
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('srivani_token');
    const user = localStorage.getItem('srivani_user');
    return !!(token && user);
  }

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('srivani_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }

  /**
   * Get stored token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('srivani_token');
  }
}

export const authService = new AuthService();
export default authService;
