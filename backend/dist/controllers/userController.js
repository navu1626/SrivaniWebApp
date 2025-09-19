"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const express_validator_1 = require("express-validator");
const userService_1 = require("@/services/userService");
const errorHandler_1 = require("@/middleware/errorHandler");
class UserController {
    async getProfile(req, res) {
        const userId = req.user.userId;
        const user = await userService_1.userService.findById(userId);
        if (!user) {
            throw new errorHandler_1.NotFoundError('User not found');
        }
        const response = {
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
    async updateProfile(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const userId = req.user.userId;
        const updateData = req.body;
        const updatedUser = await userService_1.userService.updateProfile(userId, updateData);
        const response = {
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
    async getStatistics(req, res) {
        const userId = req.user.userId;
        const statistics = await userService_1.userService.getUserStatistics(userId);
        const response = {
            success: true,
            message: 'Statistics retrieved successfully',
            data: statistics,
        };
        res.status(200).json(response);
    }
    async getUserById(req, res) {
        const { userId } = req.params;
        if (!userId) {
            throw new errorHandler_1.ValidationError('User ID is required');
        }
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
    async updateUserById(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const { userId } = req.params;
        const updateData = req.body;
        if (!userId) {
            throw new errorHandler_1.ValidationError('User ID is required');
        }
        const updatedUser = await userService_1.userService.updateProfile(userId, updateData);
        const response = {
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
    async getUserStatistics(req, res) {
        const { userId } = req.params;
        if (!userId) {
            throw new errorHandler_1.ValidationError('User ID is required');
        }
        const statistics = await userService_1.userService.getUserStatistics(userId);
        const response = {
            success: true,
            message: 'User statistics retrieved successfully',
            data: statistics,
        };
        res.status(200).json(response);
    }
    async getAllUsers(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError('Validation failed');
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const result = await userService_1.userService.getAllUsers(page, limit, search);
        const response = {
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
    async activateUser(req, res) {
        const { userId } = req.params;
        if (!userId) {
            throw new errorHandler_1.ValidationError('User ID is required');
        }
        await userService_1.userService.activateUser(userId);
        const response = {
            success: true,
            message: 'User activated successfully',
        };
        res.status(200).json(response);
    }
    async deactivateUser(req, res) {
        const { userId } = req.params;
        if (!userId) {
            throw new errorHandler_1.ValidationError('User ID is required');
        }
        await userService_1.userService.deactivateUser(userId);
        const response = {
            success: true,
            message: 'User deactivated successfully',
        };
        res.status(200).json(response);
    }
    async exportUsers(req, res) {
        const search = req.query.search;
        const result = await userService_1.userService.getAllUsers(1, 10000, search);
        const response = {
            success: true,
            message: 'Users exported successfully',
            data: result.users,
        };
        res.status(200).json(response);
    }
    async changeUserPassword(req, res) {
        const { userId } = req.params;
        const { newPassword } = req.body;
        if (!userId) {
            throw new errorHandler_1.ValidationError('User ID is required');
        }
        if (!newPassword || newPassword.length < 6) {
            throw new errorHandler_1.ValidationError('New password must be at least 6 characters long');
        }
        await userService_1.userService.changeUserPassword(userId, newPassword);
        const response = {
            success: true,
            message: 'Password changed successfully and user has been notified',
        };
        res.status(200).json(response);
    }
}
exports.userController = new UserController();
//# sourceMappingURL=userController.js.map