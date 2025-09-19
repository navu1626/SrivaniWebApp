import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { emailService } from '../services/emailService';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  JWTPayload,
  ApiResponse 
} from '../types';
import { 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  NotFoundError 
} from '../middleware/errorHandler';

class AuthController {
  /**
   * User login
   */
  async login(req: Request, res: Response): Promise<void> {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await userService.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.IsActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Enforce email verification
    if (!user.IsEmailVerified) {
      throw new AuthenticationError('Email not verified. Please check your inbox for the verification email.');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await authService.generateTokens(user);

    // Update last login date
    await userService.updateLastLogin(user.UserID);

    // Create session
    await authService.createSession(user.UserID, accessToken, refreshToken, req);

    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      user: {
        UserID: user.UserID,
        Email: user.Email,
        FirstName: user.FirstName,
        LastName: user.LastName,
        FullName: user.FullName,
        MobileNumber: user.MobileNumber || undefined,
        DateOfBirth: user.DateOfBirth || undefined,
        AgeGroup: user.AgeGroup,
        Gender: user.Gender || undefined,
        PreferredLanguage: user.PreferredLanguage,
        Role: user.Role,
        IsActive: user.IsActive,
        IsEmailVerified: user.IsEmailVerified,
        ProfileImageURL: user.ProfileImageURL || undefined,
        City: user.City || undefined,
        State: user.State || undefined,
        Country: user.Country,
        CreatedDate: user.CreatedDate,
        UpdatedDate: user.UpdatedDate,
        CreatedBy: user.CreatedBy || undefined,
        UpdatedBy: user.UpdatedBy || undefined,
      },
      token: accessToken,
      refreshToken,
    };

    res.status(200).json(response);
  }

  /**
   * User registration
   */
  async register(req: Request, res: Response): Promise<void> {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const userData: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await userService.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await userService.createUser(userData);

    // Send verification email
    await emailService.sendVerificationEmail(user);

    const response: AuthResponse = {
      success: true,
      message: 'Registration successful. Please check your email for verification.',
      user: {
        UserID: user.UserID,
        Email: user.Email,
        FirstName: user.FirstName,
        LastName: user.LastName,
        FullName: user.FullName,
        MobileNumber: user.MobileNumber || undefined,
        DateOfBirth: user.DateOfBirth || undefined,
        AgeGroup: user.AgeGroup,
        Gender: user.Gender || undefined,
        PreferredLanguage: user.PreferredLanguage,
        Role: user.Role,
        IsActive: user.IsActive,
        IsEmailVerified: user.IsEmailVerified,
        ProfileImageURL: user.ProfileImageURL || undefined,
        City: user.City || undefined,
        State: user.State || undefined,
        Country: user.Country,
        CreatedDate: user.CreatedDate,
        UpdatedDate: user.UpdatedDate,
        CreatedBy: user.CreatedBy || undefined,
        UpdatedBy: user.UpdatedBy || undefined,
      },
    };

    res.status(201).json(response);
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };

    res.status(200).json(response);
  }

  /**
   * User logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token && req.user) {
      await authService.invalidateSession(req.user.userId, token);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Logout successful',
    };

    res.status(200).json(response);
  }

  /**
   * Forgot password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { email } = req.body;

    const user = await userService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      };
      res.status(200).json(response);
      return;
    }

    // Generate reset token
    const resetToken = await authService.generatePasswordResetToken(user.UserID);

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset link has been sent to your email.',
    };

    res.status(200).json(response);
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    };

    res.status(200).json(response);
  }

  /**
   * Change password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed');
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    await authService.changePassword(userId, currentPassword, newPassword);

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully.',
    };

    res.status(200).json(response);
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    if (!token) {
      throw new ValidationError('Verification token is required');
    }

  console.debug(`[authController.verifyEmail] invoked for token=${token} at ${new Date().toISOString()}`);
  await authService.verifyEmail(token);

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully.',
    };

    res.status(200).json(response);
  }

  /**
   * Resend verification email
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    const user = await userService.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.IsEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = await authService.generateEmailVerificationToken(userId);

    // Send verification email
    await emailService.sendVerificationEmail({ ...user, EmailVerificationToken: verificationToken });

    const response: ApiResponse = {
      success: true,
      message: 'Verification email sent successfully.',
    };

    res.status(200).json(response);
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

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
}

export const authController = new AuthController();
