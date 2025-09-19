"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_1 = require("@/config/database");
const errorHandler_1 = require("@/middleware/errorHandler");
class UserService {
    async findByEmail(email) {
        try {
            debugger;
            const query = `
        SELECT * FROM Users 
        WHERE Email = @email AND IsActive = 1
      `;
            const result = await (0, database_1.executeQuery)(query, { email });
            return result.recordset.length > 0 ? result.recordset[0] : null;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to find user by email');
        }
    }
    async findById(userId) {
        try {
            const query = `
        SELECT * FROM Users 
        WHERE UserID = @userId AND IsActive = 1
      `;
            const result = await (0, database_1.executeQuery)(query, { userId });
            return result.recordset.length > 0 ? result.recordset[0] : null;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to find user by ID');
        }
    }
    async createUser(userData) {
        try {
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new errorHandler_1.ConflictError('User with this email already exists');
            }
            const userId = (0, uuid_1.v4)();
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            const salt = await bcryptjs_1.default.genSalt(saltRounds);
            const passwordHash = await bcryptjs_1.default.hash(userData.password, salt);
            const emailVerificationToken = (0, uuid_1.v4)();
            let ageGroup = userData.ageGroup;
            if (!ageGroup && userData.dateOfBirth) {
                const birthDate = new Date(userData.dateOfBirth);
                const today = new Date();
                const age = today.getFullYear() - birthDate.getFullYear();
                if (age <= 12)
                    ageGroup = 'Child';
                else if (age <= 25)
                    ageGroup = 'Youth';
                else
                    ageGroup = 'Adult';
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
            await (0, database_1.executeQuery)(query, {
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
            const statsQuery = `
        INSERT INTO UserStatistics (UserID) VALUES (@userId)
      `;
            await (0, database_1.executeQuery)(statsQuery, { userId });
            const createdUser = await this.findById(userId);
            if (!createdUser) {
                throw new errorHandler_1.DatabaseError('Failed to retrieve created user');
            }
            return createdUser;
        }
        catch (error) {
            if (error instanceof errorHandler_1.ConflictError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to create user');
        }
    }
    async updateProfile(userId, updateData) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            const allowedFields = [
                'FirstName', 'LastName', 'MobileNumber', 'DateOfBirth',
                'Gender', 'PreferredLanguage', 'City', 'State', 'ProfileImageURL'
            ];
            const updateFields = [];
            const updateParams = { userId };
            Object.entries(updateData).forEach(([key, value]) => {
                if (allowedFields.includes(key) && value !== undefined) {
                    updateFields.push(`${key} = @${key.toLowerCase()}`);
                    updateParams[key.toLowerCase()] = value;
                }
            });
            if (updateFields.length === 0) {
                return user;
            }
            updateFields.push('UpdatedDate = GETUTCDATE()');
            updateFields.push('UpdatedBy = @userId');
            const query = `
        UPDATE Users 
        SET ${updateFields.join(', ')}
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(query, updateParams);
            const updatedUser = await this.findById(userId);
            if (!updatedUser) {
                throw new errorHandler_1.DatabaseError('Failed to retrieve updated user');
            }
            return updatedUser;
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to update user profile');
        }
    }
    async updateLastLogin(userId) {
        try {
            const query = `
        UPDATE Users 
        SET LastLoginDate = GETUTCDATE()
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(query, { userId });
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to update last login date');
        }
    }
    async getUserStatistics(userId) {
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
            const result = await (0, database_1.executeQuery)(query, { userId });
            return result.recordset.length > 0 ? result.recordset[0] : null;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to get user statistics');
        }
    }
    async getAllUsers(page = 1, limit = 10, search) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = 'WHERE IsActive = 1';
            const params = { limit, offset };
            if (search) {
                whereClause += ` AND (FirstName LIKE @search OR LastName LIKE @search OR Email LIKE @search)`;
                params.search = `%${search}%`;
            }
            const countQuery = `SELECT COUNT(*) as total FROM Users ${whereClause}`;
            const countResult = await (0, database_1.executeQuery)(countQuery, search ? { search: params.search } : {});
            const total = countResult.recordset[0]?.total || 0;
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
            const result = await (0, database_1.executeQuery)(query, params);
            return {
                users: result.recordset,
                total,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to get users');
        }
    }
    async deactivateUser(userId) {
        try {
            const query = `
        UPDATE Users 
        SET IsActive = 0, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;
            const result = await (0, database_1.executeQuery)(query, { userId });
            if (result.rowsAffected[0] === 0) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            const invalidateSessionsQuery = `
        UPDATE UserSessions 
        SET IsActive = 0 
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(invalidateSessionsQuery, { userId });
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to deactivate user');
        }
    }
    async activateUser(userId) {
        try {
            const query = `
        UPDATE Users
        SET IsActive = 1, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;
            const result = await (0, database_1.executeQuery)(query, { userId });
            if (result.rowsAffected[0] === 0) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to activate user');
        }
    }
    async changeUserPassword(userId, newPassword) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            const salt = await bcryptjs_1.default.genSalt(saltRounds);
            const passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
            const query = `
        UPDATE Users
        SET PasswordHash = @passwordHash, Salt = @salt, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;
            const result = await (0, database_1.executeQuery)(query, { userId, passwordHash, salt });
            if (result.rowsAffected[0] === 0) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            try {
                const { emailService } = await Promise.resolve().then(() => __importStar(require('@/services/emailService')));
                await emailService.sendPasswordChangedNotification(user, newPassword);
            }
            catch (emailError) {
                console.error('Failed to send password change notification:', emailError);
            }
        }
        catch (error) {
            if (error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to change user password');
        }
    }
}
exports.userService = new UserService();
//# sourceMappingURL=userService.js.map