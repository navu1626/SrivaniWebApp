import api, { 
  ApiResponse, 
  User,
  handleApiError 
} from './api';

export interface UserStatistics {
  TotalCompetitionsParticipated: number;
  TotalCompetitionsCompleted: number;
  AverageScore: number;
  BestScore: number;
  TotalPointsEarned: number;
  CurrentStreak: number;
  LongestStreak: number;
  TotalTimeSpentMinutes: number;
  FavoriteCategory?: string;
  LastActivityDate?: string;
  Level: string;
  Badges?: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UserUpdateData {
  FirstName?: string;
  LastName?: string;
  MobileNumber?: string;
  DateOfBirth?: string;
  Gender?: 'Male' | 'Female' | 'Other';
  PreferredLanguage?: 'English' | 'Hindi';
  City?: string;
  State?: string;
  ProfileImageURL?: string;
}

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await api.get<ApiResponse<User>>('/users/profile');
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to get profile'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(updateData: Partial<User>): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await api.put<ApiResponse<User>>('/users/profile', updateData);
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to update profile'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get current user statistics
   */
  async getStatistics(): Promise<{ success: boolean; statistics?: UserStatistics; message: string }> {
    try {
      const response = await api.get<ApiResponse<UserStatistics>>('/users/statistics');
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          statistics: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to get statistics'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get all users (admin only) with pagination and search
   */
  async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<{ 
    success: boolean; 
    data?: PaginatedUsersResponse; 
    message: string 
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await api.get<ApiResponse<User[]> & { pagination: any }>(`/users?${params}`);
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: {
            users: response.data.data,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            hasNext: response.data.pagination.hasNext,
            hasPrev: response.data.pagination.hasPrev
          },
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to get users'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to get user'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Update user by ID (admin only)
   */
  async updateUserById(userId: string, updateData: UserUpdateData): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const response = await api.put<ApiResponse<User>>(`/users/${userId}`, updateData);
      
      if (response.data.success && response.data.data) {
        return {
          success: true,
          user: response.data.data,
          message: response.data.message
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Failed to update user'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch<ApiResponse>(`/users/${userId}/activate`);
      
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
   * Deactivate user (admin only)
   */
  async deactivateUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch<ApiResponse>(`/users/${userId}/deactivate`);
      
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
   * Export users data (admin only)
   */
  async exportUsers(search?: string): Promise<{ success: boolean; data?: User[]; message: string }> {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      const response = await api.get<ApiResponse<User[]>>(`/users/export?${params}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        message: response.data.message || 'Failed to export users'
      };
    } catch (error) {
      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Change user password (admin only)
   */
  async changeUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.patch<ApiResponse>(`/users/${userId}/change-password`, {
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
}

export const userService = new UserService();
