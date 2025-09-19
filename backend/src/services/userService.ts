import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeStoredProcedure } from '@/config/database';
import { User, RegisterRequest } from '@/types';
import { 
  DatabaseError, 
  NotFoundError, 
  ConflictError 
} from '@/middleware/errorHandler';

class UserService {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      debugger;
      const query = `
        SELECT * FROM Users 
        WHERE Email = @email AND IsActive = 1
      `;

      const result = await executeQuery<User>(query, { email });
      return result.recordset.length > 0 ? result.recordset[0]! : null;
    } catch (error) {
      throw new DatabaseError('Failed to find user by email');
    }
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    try {
      const query = `
        SELECT * FROM Users 
        WHERE UserID = @userId AND IsActive = 1
      `;

      const result = await executeQuery<User>(query, { userId });
      return result.recordset.length > 0 ? result.recordset[0]! : null;
    } catch (error) {
      throw new DatabaseError('Failed to find user by ID');
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: RegisterRequest): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Generate user ID and hash password
      const userId = uuidv4();
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      const emailVerificationToken = uuidv4();

      // Determine age group if not provided
      let ageGroup = userData.ageGroup;
      if (!ageGroup && userData.dateOfBirth) {
        const birthDate = new Date(userData.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age <= 12) ageGroup = 'Child';
        else if (age <= 25) ageGroup = 'Youth';
        else ageGroup = 'Adult';
      }

      const query = `
        INSERT INTO Users (
          UserID, Email, PasswordHash, Salt, FirstName, LastName,
          MobileNumber, DateOfBirth, AgeGroup, Gender, PreferredLanguage,
          City, State, EmailVerificationToken
        ) VALUES (
          @userId, @email, @passwordHash, @salt, @firstName, @lastName,
          @mobileNumber, @dateOfBirth, @ageGroup, @gender, @preferredLanguage,
          @city, @state, @emailVerificationToken
        )
      `;

      await executeQuery(query, {
        userId,
        email: userData.email,
        passwordHash,
        salt,
        firstName: userData.firstName,
        lastName: userData.lastName,
        mobileNumber: userData.mobileNumber || null,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
        ageGroup: ageGroup || 'Adult',
        gender: userData.gender || null,
        preferredLanguage: userData.preferredLanguage || 'English',
        city: userData.city || null,
        state: userData.state || null,
        emailVerificationToken,
      });

      // Initialize user statistics
      const statsQuery = `
        INSERT INTO UserStatistics (UserID) VALUES (@userId)
      `;
      await executeQuery(statsQuery, { userId });

      // Return the created user
      const createdUser = await this.findById(userId);
      if (!createdUser) {
        throw new DatabaseError('Failed to retrieve created user');
      }

      return createdUser;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new DatabaseError('Failed to create user');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const allowedFields = [
        'FirstName', 'LastName', 'MobileNumber', 'DateOfBirth',
        'Gender', 'PreferredLanguage', 'City', 'State', 'ProfileImageURL'
      ];

      const updateFields: string[] = [];
      const updateParams: Record<string, any> = { userId };

      Object.entries(updateData).forEach(([key, value]) => {
        if (allowedFields.includes(key) && value !== undefined) {
          updateFields.push(`${key} = @${key.toLowerCase()}`);
          updateParams[key.toLowerCase()] = value;
        }
      });

      if (updateFields.length === 0) {
        return user; // No fields to update
      }

      updateFields.push('UpdatedDate = GETUTCDATE()');
      updateFields.push('UpdatedBy = @userId');

      const query = `
        UPDATE Users 
        SET ${updateFields.join(', ')}
        WHERE UserID = @userId
      `;

      await executeQuery(query, updateParams);

      // Return updated user
      const updatedUser = await this.findById(userId);
      if (!updatedUser) {
        throw new DatabaseError('Failed to retrieve updated user');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to update user profile');
    }
  }

  /**
   * Update last login date
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE Users 
        SET LastLoginDate = GETUTCDATE()
        WHERE UserID = @userId
      `;

      await executeQuery(query, { userId });
    } catch (error) {
      throw new DatabaseError('Failed to update last login date');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          us.*,
          (SELECT COUNT(*) FROM UserCompetitions uc WHERE uc.UserID = @userId AND uc.IsActive = 1) as TotalRegistrations,
          (SELECT COUNT(*) FROM QuizAttempts qa WHERE qa.UserID = @userId AND qa.Status = 'Completed') as CompletedQuizzes,
          (SELECT AVG(CAST(cr.PercentageScore as FLOAT)) FROM CompetitionResults cr WHERE cr.UserID = @userId) as AveragePercentage,
          (SELECT COUNT(*) FROM CompetitionResults cr WHERE cr.UserID = @userId AND cr.Rank = 1) as FirstPlaceFinishes
        FROM UserStatistics us
        WHERE us.UserID = @userId
      `;

      const result = await executeQuery(query, { userId });
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      throw new DatabaseError('Failed to get user statistics');
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<{
    users: Omit<User, 'PasswordHash' | 'Salt'>[];
    total: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE IsActive = 1';
      const params: Record<string, any> = { limit, offset };

      if (search) {
        whereClause += ` AND (FirstName LIKE @search OR LastName LIKE @search OR Email LIKE @search)`;
        params.search = `%${search}%`;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM Users ${whereClause}`;
      const countResult = await executeQuery<{ total: number }>(countQuery, search ? { search: params.search } : {});
      const total = countResult.recordset[0]?.total || 0;

      // Get users
      const query = `
        SELECT 
          UserID, Email, FirstName, LastName, FullName, MobileNumber,
          DateOfBirth, AgeGroup, Gender, PreferredLanguage, Role,
          IsActive, IsEmailVerified, ProfileImageURL, City, State, Country,
          CreatedDate, UpdatedDate, LastLoginDate
        FROM Users 
        ${whereClause}
        ORDER BY CreatedDate DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      const result = await executeQuery<Omit<User, 'PasswordHash' | 'Salt'>>(query, params);

      return {
        users: result.recordset,
        total,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new DatabaseError('Failed to get users');
    }
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE Users 
        SET IsActive = 0, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;

      const result = await executeQuery(query, { userId });

      if (result.rowsAffected[0] === 0) {
        throw new NotFoundError('User not found');
      }

      // Invalidate all sessions
      const invalidateSessionsQuery = `
        UPDATE UserSessions 
        SET IsActive = 0 
        WHERE UserID = @userId
      `;

      await executeQuery(invalidateSessionsQuery, { userId });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to deactivate user');
    }
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<void> {
    try {
      const query = `
        UPDATE Users
        SET IsActive = 1, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;

      const result = await executeQuery(query, { userId });

      if (result.rowsAffected[0] === 0) {
        throw new NotFoundError('User not found');
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to activate user');
    }
  }

  /**
   * Change user password (admin only)
   */
  async changeUserPassword(userId: string, newPassword: string): Promise<void> {
    try {
      // First, get the user to send email notification
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Generate new password hash
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password in database
      const query = `
        UPDATE Users
        SET PasswordHash = @passwordHash, Salt = @salt, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;

      const result = await executeQuery(query, { userId, passwordHash, salt });

      if (result.rowsAffected[0] === 0) {
        throw new NotFoundError('User not found');
      }

      // Send email notification to user
      try {
        const { emailService } = await import('@/services/emailService');
        await emailService.sendPasswordChangedNotification(user, newPassword);
      } catch (emailError) {
        // Log email error but don't fail the password change
        console.error('Failed to send password change notification:', emailError);
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to change user password');
    }
  }
}

export const userService = new UserService();
