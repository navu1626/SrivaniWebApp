"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = require("@/config/database");
const errorHandler_1 = require("@/middleware/errorHandler");
class AuthService {
    async generateTokens(user) {
        const jwtSecret = process.env.JWT_SECRET;
        const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
        if (!jwtSecret || !jwtRefreshSecret) {
            throw new Error('JWT secrets not configured');
        }
        const payload = {
            userId: user.UserID,
            email: user.Email,
            role: user.Role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecret, {
            expiresIn: process.env.JWT_EXPIRE || '24h',
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, jwtRefreshSecret, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
        });
        return { accessToken, refreshToken };
    }
    async createSession(userId, accessToken, refreshToken, req) {
        try {
            const sessionId = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            const query = `
        INSERT INTO UserSessions (
          SessionID, UserID, SessionToken, RefreshToken, 
          IPAddress, UserAgent, ExpiresAt
        ) VALUES (
          @sessionId, @userId, @accessToken, @refreshToken,
          @ipAddress, @userAgent, @expiresAt
        )
      `;
            await (0, database_1.executeQuery)(query, {
                sessionId,
                userId,
                accessToken,
                refreshToken,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                expiresAt,
            });
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to create session');
        }
    }
    async refreshAccessToken(refreshToken) {
        try {
            const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
            if (!jwtRefreshSecret) {
                throw new Error('JWT refresh secret not configured');
            }
            const decoded = jsonwebtoken_1.default.verify(refreshToken, jwtRefreshSecret);
            const sessionQuery = `
        SELECT * FROM UserSessions 
        WHERE RefreshToken = @refreshToken AND IsActive = 1 AND ExpiresAt > GETUTCDATE()
      `;
            const sessionResult = await (0, database_1.executeQuery)(sessionQuery, { refreshToken });
            if (!sessionResult.recordset.length) {
                throw new errorHandler_1.AuthenticationError('Invalid or expired refresh token');
            }
            debugger;
            const userQuery = `SELECT * FROM Users WHERE UserID = @userId AND IsActive = 1`;
            const userResult = await (0, database_1.executeQuery)(userQuery, { userId: decoded.userId });
            if (!userResult.recordset.length) {
                throw new errorHandler_1.AuthenticationError('User not found or inactive');
            }
            const user = userResult.recordset[0];
            if (!user) {
                throw new errorHandler_1.AuthenticationError('User not found');
            }
            const tokens = await this.generateTokens(user);
            const updateQuery = `
        UPDATE UserSessions 
        SET SessionToken = @accessToken, RefreshToken = @newRefreshToken, LastAccessedDate = GETUTCDATE()
        WHERE RefreshToken = @oldRefreshToken
      `;
            await (0, database_1.executeQuery)(updateQuery, {
                accessToken: tokens.accessToken,
                newRefreshToken: tokens.refreshToken,
                oldRefreshToken: refreshToken,
            });
            return tokens;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError || error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errorHandler_1.AuthenticationError('Invalid or expired refresh token');
            }
            throw error;
        }
    }
    async invalidateSession(userId, accessToken) {
        try {
            const query = `
        UPDATE UserSessions 
        SET IsActive = 0 
        WHERE UserID = @userId AND SessionToken = @accessToken
      `;
            await (0, database_1.executeQuery)(query, { userId, accessToken });
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to invalidate session');
        }
    }
    async generatePasswordResetToken(userId) {
        try {
            const resetToken = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 1);
            const query = `
        UPDATE Users 
        SET PasswordResetToken = @resetToken, PasswordResetExpiry = @expiresAt
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(query, { resetToken, expiresAt, userId });
            return resetToken;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to generate password reset token');
        }
    }
    async resetPassword(token, newPassword) {
        try {
            const query = `
        SELECT UserID FROM Users 
        WHERE PasswordResetToken = @token 
        AND PasswordResetExpiry > GETUTCDATE()
        AND IsActive = 1
      `;
            const result = await (0, database_1.executeQuery)(query, { token });
            if (!result.recordset.length) {
                throw new errorHandler_1.ValidationError('Invalid or expired reset token');
            }
            const userRecord = result.recordset[0];
            if (!userRecord) {
                throw new errorHandler_1.ValidationError('Invalid or expired reset token');
            }
            const userId = userRecord.UserID;
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            const salt = await bcryptjs_1.default.genSalt(saltRounds);
            const passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
            const updateQuery = `
        UPDATE Users 
        SET PasswordHash = @passwordHash, 
            Salt = @salt,
            PasswordResetToken = NULL, 
            PasswordResetExpiry = NULL,
            UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(updateQuery, { passwordHash, salt, userId });
            const invalidateSessionsQuery = `
        UPDATE UserSessions 
        SET IsActive = 0 
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(invalidateSessionsQuery, { userId });
        }
        catch (error) {
            if (error instanceof errorHandler_1.ValidationError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to reset password');
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const userQuery = `SELECT PasswordHash FROM Users WHERE UserID = @userId AND IsActive = 1`;
            const userResult = await (0, database_1.executeQuery)(userQuery, { userId });
            if (!userResult.recordset.length) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            const user = userResult.recordset[0];
            if (!user) {
                throw new errorHandler_1.NotFoundError('User not found');
            }
            const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.PasswordHash);
            if (!isCurrentPasswordValid) {
                throw new errorHandler_1.ValidationError('Current password is incorrect');
            }
            const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            const salt = await bcryptjs_1.default.genSalt(saltRounds);
            const passwordHash = await bcryptjs_1.default.hash(newPassword, salt);
            const updateQuery = `
        UPDATE Users 
        SET PasswordHash = @passwordHash, Salt = @salt, UpdatedDate = GETUTCDATE()
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(updateQuery, { passwordHash, salt, userId });
        }
        catch (error) {
            if (error instanceof errorHandler_1.ValidationError || error instanceof errorHandler_1.NotFoundError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to change password');
        }
    }
    async generateEmailVerificationToken(userId) {
        try {
            const verificationToken = (0, uuid_1.v4)();
            const query = `
        UPDATE Users 
        SET EmailVerificationToken = @verificationToken
        WHERE UserID = @userId
      `;
            await (0, database_1.executeQuery)(query, { verificationToken, userId });
            return verificationToken;
        }
        catch (error) {
            throw new errorHandler_1.DatabaseError('Failed to generate email verification token');
        }
    }
    async verifyEmail(token) {
        try {
            const selectQuery = `
        SELECT UserID FROM Users
        WHERE EmailVerificationToken = @token AND IsActive = 1
      `;
            const selectResult = await (0, database_1.executeQuery)(selectQuery, { token });
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
                await (0, database_1.executeQuery)(updateQuery, { userId });
                return;
            }
            console.warn('verifyEmail: token not found or already used');
            return;
        }
        catch (error) {
            if (error instanceof errorHandler_1.ValidationError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to verify email');
        }
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map