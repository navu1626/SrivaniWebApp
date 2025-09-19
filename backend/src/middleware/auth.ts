import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { AuthenticationError, AuthorizationError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT token
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AuthenticationError('No authorization header provided');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user is admin
 */
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not authenticated');
    }

    if (req.user.role !== 'Admin') {
      throw new AuthorizationError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user can access their own resources or is admin
 */
export const ownerOrAdminMiddleware = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      const requestedUserId = req.params[userIdParam];
      const currentUserId = req.user.userId;
      const isAdmin = req.user.role === 'Admin';

      if (!isAdmin && requestedUserId !== currentUserId) {
        throw new AuthorizationError('Access denied: You can only access your own resources');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional auth middleware - doesn't throw error if no token
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    req.user = decoded;
    
    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};
