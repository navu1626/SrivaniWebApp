"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.ownerOrAdminMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.AuthenticationError('No authorization header provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new errorHandler_1.AuthenticationError('No token provided');
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new errorHandler_1.AuthenticationError('Invalid token'));
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new errorHandler_1.AuthenticationError('Token expired'));
        }
        else {
            next(error);
        }
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AuthenticationError('User not authenticated');
        }
        if (req.user.role !== 'Admin') {
            throw new errorHandler_1.AuthorizationError('Admin access required');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.adminMiddleware = adminMiddleware;
const ownerOrAdminMiddleware = (userIdParam = 'userId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errorHandler_1.AuthenticationError('User not authenticated');
            }
            const requestedUserId = req.params[userIdParam];
            const currentUserId = req.user.userId;
            const isAdmin = req.user.role === 'Admin';
            if (!isAdmin && requestedUserId !== currentUserId) {
                throw new errorHandler_1.AuthorizationError('Access denied: You can only access your own resources');
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.ownerOrAdminMiddleware = ownerOrAdminMiddleware;
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=auth.js.map