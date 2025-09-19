"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const authService_1 = require("../services/authService");
const userService_1 = require("../services/userService");
const emailService_1 = require("../services/emailService");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    async login(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { email, password } = req.body;
        const user = await userService_1.userService.findByEmail(email);
        if (!user) {
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        if (!user.IsActive) {
            throw new errorHandler_1.AuthenticationError('Account is deactivated');
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.PasswordHash);
        if (!isPasswordValid) {
            throw new errorHandler_1.AuthenticationError('Invalid email or password');
        }
        if (!user.IsEmailVerified) {
            throw new errorHandler_1.AuthenticationError('Email not verified. Please check your inbox for the verification email.');
        }
        const { accessToken, refreshToken } = await authService_1.authService.generateTokens(user);
        await userService_1.userService.updateLastLogin(user.UserID);
        await authService_1.authService.createSession(user.UserID, accessToken, refreshToken, req);
        const response = {
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
    async register(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const userData = req.body;
        const existingUser = await userService_1.userService.findByEmail(userData.email);
        if (existingUser) {
            throw new errorHandler_1.ConflictError('User with this email already exists');
        }
        const user = await userService_1.userService.createUser(userData);
        await emailService_1.emailService.sendVerificationEmail(user);
        const response = {
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
    async refreshToken(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new errorHandler_1.AuthenticationError('Refresh token is required');
        }
        const { accessToken, refreshToken: newRefreshToken } = await authService_1.authService.refreshAccessToken(refreshToken);
        const response = {
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        };
        res.status(200).json(response);
    }
    async logout(req, res) {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (token && req.user) {
            await authService_1.authService.invalidateSession(req.user.userId, token);
        }
        const response = {
            success: true,
            message: 'Logout successful',
        };
        res.status(200).json(response);
    }
    async forgotPassword(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { email } = req.body;
        const user = await userService_1.userService.findByEmail(email);
        if (!user) {
            const response = {
                success: true,
                message: 'If the email exists, a password reset link has been sent.',
            };
            res.status(200).json(response);
            return;
        }
        const resetToken = await authService_1.authService.generatePasswordResetToken(user.UserID);
        await emailService_1.emailService.sendPasswordResetEmail(user, resetToken);
        const response = {
            success: true,
            message: 'Password reset link has been sent to your email.',
        };
        res.status(200).json(response);
    }
    async resetPassword(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { token, password } = req.body;
        await authService_1.authService.resetPassword(token, password);
        const response = {
            success: true,
            message: 'Password reset successful. You can now login with your new password.',
        };
        res.status(200).json(response);
    }
    async changePassword(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        await authService_1.authService.changePassword(userId, currentPassword, newPassword);
        const response = {
            success: true,
            message: 'Password changed successfully.',
        };
        res.status(200).json(response);
    }
    async verifyEmail(req, res) {
        const { token } = req.params;
        if (!token) {
            throw new errorHandler_1.ValidationError('Verification token is required');
        }
        console.debug(`[authController.verifyEmail] invoked for token=${token} at ${new Date().toISOString()}`);
        await authService_1.authService.verifyEmail(token);
        const response = {
            success: true,
            message: 'Email verified successfully.',
        };
        res.status(200).json(response);
    }
    async resendVerification(req, res) {
        const userId = req.user.userId;
        const user = await userService_1.userService.findById(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User not found');
        }
        if (user.IsEmailVerified) {
            throw new errorHandler_1.ValidationError('Email is already verified');
        }
        const verificationToken = await authService_1.authService.generateEmailVerificationToken(userId);
        await emailService_1.emailService.sendVerificationEmail({ ...user, EmailVerificationToken: verificationToken });
        const response = {
            success: true,
            message: 'Verification email sent successfully.',
        };
        res.status(200).json(response);
    }
    async getCurrentUser(req, res) {
        const userId = req.user.userId;
        const user = await userService_1.userService.findById(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User not found');
        }
        const response = {
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
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map