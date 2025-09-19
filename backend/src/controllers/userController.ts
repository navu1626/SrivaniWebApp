import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { userService } from '@/services/userService';
import { ApiResponse, PaginatedResponse } from '@/types';
import { 
  ValidationError, 
  NotFoundError 
} from '@/middleware/errorHandler';

class UserController {
  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const user = await userService.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        UserID: user.UserID,
        Email: user.Email,
        FirstName: user.FirstName,
        LastName: user.LastName,
        FullName: user.FullName,
        MobileNumber: user.MobileNumber,
        DateOfBirth: user.DateOfBirth,
        AgeGroup: user.AgeGroup,
        Gender: user.Gender,
        PreferredLanguage: user.PreferredLanguage,
        Role: user.Role,
        IsActive: user.IsActive,
        IsEmailVerified: user.IsEmailVerified,
        ProfileImageURL: user.ProfileImageURL,
        City: user.City,
        State: user.State,
        Country: user.Country,
        CreatedDate: user.CreatedDate,
        UpdatedDate: user.UpdatedDate,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Update current user profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const userId = req.user!.userId;
    const updateData = req.body;

    const updatedUser = await userService.updateProfile(userId, updateData);

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        UserID: updatedUser.UserID,
        Email: updatedUser.Email,
        FirstName: updatedUser.FirstName,
        LastName: updatedUser.LastName,
        FullName: updatedUser.FullName,
        MobileNumber: updatedUser.MobileNumber,
        DateOfBirth: updatedUser.DateOfBirth,
        AgeGroup: updatedUser.AgeGroup,
        Gender: updatedUser.Gender,
        PreferredLanguage: updatedUser.PreferredLanguage,
        Role: updatedUser.Role,
        IsActive: updatedUser.IsActive,
        IsEmailVerified: updatedUser.IsEmailVerified,
        ProfileImageURL: updatedUser.ProfileImageURL,
        City: updatedUser.City,
        State: updatedUser.State,
        Country: updatedUser.Country,
        CreatedDate: updatedUser.CreatedDate,
        UpdatedDate: updatedUser.UpdatedDate,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Get current user statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const statistics = await userService.getUserStatistics(userId);

    const response: ApiResponse = {
      success: true,
      message: 'Statistics retrieved successfully',
      data: statistics,
    };

    res.status(200).json(response);
  }

  /**
   * Get user by ID (admin or owner)
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const user = await userService.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: {
        UserID: user.UserID,
        Email: user.Email,
        FirstName: user.FirstName,
        LastName: user.LastName,
        FullName: user.FullName,
        MobileNumber: user.MobileNumber,
        DateOfBirth: user.DateOfBirth,
        AgeGroup: user.AgeGroup,
        Gender: user.Gender,
        PreferredLanguage: user.PreferredLanguage,
        Role: user.Role,
        IsActive: user.IsActive,
        IsEmailVerified: user.IsEmailVerified,
        ProfileImageURL: user.ProfileImageURL,
        City: user.City,
        State: user.State,
        Country: user.Country,
        CreatedDate: user.CreatedDate,
        UpdatedDate: user.UpdatedDate,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Update user by ID (admin or owner)
   */
  async updateUserById(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { userId } = req.params;
    const updateData = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const updatedUser = await userService.updateProfile(userId, updateData);

    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: {
        UserID: updatedUser.UserID,
        Email: updatedUser.Email,
        FirstName: updatedUser.FirstName,
        LastName: updatedUser.LastName,
        FullName: updatedUser.FullName,
        MobileNumber: updatedUser.MobileNumber,
        DateOfBirth: updatedUser.DateOfBirth,
        AgeGroup: updatedUser.AgeGroup,
        Gender: updatedUser.Gender,
        PreferredLanguage: updatedUser.PreferredLanguage,
        Role: updatedUser.Role,
        IsActive: updatedUser.IsActive,
        IsEmailVerified: updatedUser.IsEmailVerified,
        ProfileImageURL: updatedUser.ProfileImageURL,
        City: updatedUser.City,
        State: updatedUser.State,
        Country: updatedUser.Country,
        CreatedDate: updatedUser.CreatedDate,
        UpdatedDate: updatedUser.UpdatedDate,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Get user statistics by ID (admin or owner)
   */
  async getUserStatistics(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const statistics = await userService.getUserStatistics(userId);

    const response: ApiResponse = {
      success: true,
      message: 'User statistics retrieved successfully',
      data: statistics,
    };

    res.status(200).json(response);
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await userService.getAllUsers(page, limit, search);

    const response: PaginatedResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: page < result.totalPages,
        hasPrev: page > 1,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    await userService.activateUser(userId);

    const response: ApiResponse = {
      success: true,
      message: 'User activated successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    await userService.deactivateUser(userId);

    const response: ApiResponse = {
      success: true,
      message: 'User deactivated successfully',
    };

    res.status(200).json(response);
  }

  /**
   * Export users to Excel (admin only)
   */
  async exportUsers(req: Request, res: Response): Promise<void> {
    const search = req.query.search as string;

    const result = await userService.getAllUsers(1, 10000, search); // Get all users for export

    const response: ApiResponse = {
      success: true,
      message: 'Users exported successfully',
      data: result.users,
    };

    res.status(200).json(response);
  }

  /**
   * Change user password (admin only)
   */
  async changeUserPassword(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters long');
    }

    await userService.changeUserPassword(userId, newPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully and user has been notified',
    };

    res.status(200).json(response);
  }
}

export const userController = new UserController();
