import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { executeQuery, executeStoredProcedure } from '../config/database';
import { User, UserSession, JWTPayload } from '../types';
import { 
  AuthenticationError, 
  ValidationError, 
  NotFoundError,
  DatabaseError 
} from '../middleware/errorHandler';

class AuthService {
  /**
   * Generate JWT access and refresh tokens
   */
  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets not configured');
    }

    const payload: JWTPayload = {
      userId: user.UserID,
      email: user.Email,
      role: user.Role,
    };

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRE || '24h',
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Create user session
   */
  async createSession(
    userId: string, 
    accessToken: string, 
    refreshToken: string, 
    req: Request
  ): Promise<void> {
    try {
      const sessionId = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const query = `
        INSERT INTO UserSessions (
          SessionID, UserID, SessionToken, RefreshToken, 
          IPAddress, UserAgent, ExpiresAt
        ) VALUES (
          @sessionId, @userId, @accessToken, @refreshToken,
          @ipAddress, @userAgent, @expiresAt
        )
      `;

      await executeQuery(query, {
        sessionId,
        userId,
        accessToken,
        refreshToken,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        expiresAt,
      });
    } catch (error) {
      throw new DatabaseError('Failed to create session');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!jwtRefreshSecret) {
        throw new Error('JWT refresh secret not configured');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as JWTPayload;

      // Check if session exists and is active
      const sessionQuery = `
        SELECT * FROM UserSessions 
        WHERE RefreshToken = @refreshToken AND IsActive = 1 AND ExpiresAt > GETUTCDATE()
      `;
      
      const sessionResult = await executeQuery<UserSession>(sessionQuery, { refreshToken });
      
      if (!sessionResult.recordset.length) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      debugger;
      // Get user details
      const userQuery = `SELECT * FROM Users WHERE UserID = @userId AND IsActive = 1`;
      const userResult = await executeQuery<User>(userQuery, { userId: decoded.userId });
      
      if (!userResult.recordset.length) {
        throw new AuthenticationError('User not found or inactive');
      }

      const user = userResult.recordset[0];
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Update session with new tokens
      const updateQuery = `
        UPDATE UserSessions 
        SET SessionToken = @accessToken, RefreshToken = @newRefreshToken, LastAccessedDate = GETUTCDATE()
        WHERE RefreshToken = @oldRefreshToken
      `;

      await executeQuery(updateQuery, {
        accessToken: tokens.accessToken,
        newRefreshToken: tokens.refreshToken,
        oldRefreshToken: refreshToken,
      });

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  /**
   * Invalidate user session
   */
  async invalidateSession(userId: string, accessToken: string): Promise<void> {
    try {
      const query = `
        UPDATE UserSessions 
        SET IsActive = 0 
        WHERE UserID = @userId AND SessionToken = @accessToken
      `;

      await executeQuery(query, { userId, accessToken });
    } catch (error) {
      throw new DatabaseError('Failed to invalidate session');
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    try {
      const resetToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      const query = `
        UPDATE Users 
        SET PasswordResetToken = @resetToken, PasswordResetExpiry = @expiresAt
        WHERE UserID = @userId
      `;

      await executeQuery(query, { resetToken, expiresAt, userId });

      return resetToken;
    } catch (error) {
      throw new DatabaseError('Failed to generate password reset token');
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user with valid reset token
      const query = `
        SELECT UserID FROM Users 
        WHERE PasswordResetToken = @token 
        AND PasswordResetExpiry > GETUTCDATE()
        AND IsActive = 1
      `;

      const result = await executeQuery<{ UserID: string }>(query, { token });

      if (!result.recordset.length) {
        throw new ValidationError('Invalid or expired reset token');
      }

      const userRecord = result.recordset[0];
      if (!userRecord) {
        throw new ValidationError('Invalid or expired reset token');
      }

      const userId = userRecord.UserID;

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      const updateQuery = `
        UPDATE Users 
        SET PasswordHash = @passwordHash, 
            Salt = @salt,
            PasswordResetToken = NULL, 
            PasswordResetExpiry = NULL,
            UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;

      await executeQuery(updateQuery, { passwordHash, salt, userId });

      // Invalidate all sessions for this user
      const invalidateSessionsQuery = `
        UPDATE UserSessions 
        SET IsActive = 0 
        WHERE UserID = @userId
      `;

      await executeQuery(invalidateSessionsQuery, { userId });
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to reset password');
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get current user
      const userQuery = `SELECT PasswordHash FROM Users WHERE UserID = @userId AND IsActive = 1`;
      const userResult = await executeQuery<{ PasswordHash: string }>(userQuery, { userId });

      if (!userResult.recordset.length) {
        throw new NotFoundError('User not found');
      }

      const user = userResult.recordset[0];
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.PasswordHash);
      if (!isCurrentPasswordValid) {
        throw new ValidationError('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      const updateQuery = `
        UPDATE Users 
        SET PasswordHash = @passwordHash, Salt = @salt, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;

      await executeQuery(updateQuery, { passwordHash, salt, userId });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to change password');
    }
  }

  /**
   * Generate email verification token
   */
  async generateEmailVerificationToken(userId: string): Promise<string> {
    try {
      const verificationToken = uuidv4();

      const query = `
        UPDATE Users 
        SET EmailVerificationToken = @verificationToken
        WHERE UserID = @userId
      `;

      await executeQuery(query, { verificationToken, userId });

      return verificationToken;
    } catch (error) {
      throw new DatabaseError('Failed to generate email verification token');
    }
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // Find user with the verification token first
      const selectQuery = `
        SELECT UserID FROM Users
        WHERE EmailVerificationToken = @token AND IsActive = 1
      `;

      const selectResult = await executeQuery<{ UserID: string }>(selectQuery, { token });

      if (selectResult.recordset.length) {
        const firstRecord = selectResult.recordset[0];
        if (!firstRecord || !firstRecord.UserID) {
          console.warn('verifyEmail: unexpected record format');
          return;
        }
        const userId = firstRecord.UserID;

        const updateQuery = `
          UPDATE Users 
          SET IsEmailVerified = 1, EmailVerificationToken = NULL, UpdatedDate = GETUTCDATE()
          WHERE UserID = @userId
        `;

        await executeQuery(updateQuery, { userId });
        return;
      }

      // If token not found, it may have already been used or expired.
      // Treat verification as idempotent to avoid errors on duplicate/auto requests.
      console.warn('verifyEmail: token not found or already used');
      return;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new DatabaseError('Failed to verify email');
    }
  }
}

export const authService = new AuthService();
