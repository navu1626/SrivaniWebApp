import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@/types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }
  // Handle validation errors
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle SQL Server errors
  else if (error.name === 'RequestError') {
    statusCode = 400;
    message = 'Database request error';
  }
  else if (error.name === 'ConnectionError') {
    statusCode = 503;
    message = 'Database connection error';
  }
  // Handle duplicate key errors
  else if (error.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
  }
  // Handle foreign key constraint errors
  else if (error.message.includes('FOREIGN KEY constraint')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  // Log error details in development
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
  } else {
    // Log only essential info in production
    console.error('Production Error:', {
      message: error.message,
      statusCode,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create specific error types
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}
