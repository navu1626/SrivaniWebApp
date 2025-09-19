"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
        isOperational = error.isOperational;
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'RequestError') {
        statusCode = 400;
        message = 'Database request error';
    }
    else if (error.name === 'ConnectionError') {
        statusCode = 503;
        message = 'Database connection error';
    }
    else if (error.message.includes('duplicate key')) {
        statusCode = 409;
        message = 'Resource already exists';
    }
    else if (error.message.includes('FOREIGN KEY constraint')) {
        statusCode = 400;
        message = 'Invalid reference to related resource';
    }
    if (process.env.NODE_ENV === 'development') {
        console.error('Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            statusCode,
            isOperational,
            url: req.url,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
        });
    }
    else {
        console.error('Production Error:', {
            message: error.message,
            statusCode,
            url: req.url,
            method: req.method,
            timestamp: new Date().toISOString(),
        });
    }
    const errorResponse = {
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
    }
}
exports.DatabaseError = DatabaseError;
//# sourceMappingURL=errorHandler.js.map