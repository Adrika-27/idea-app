import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';
import { logger } from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    bio?: string;
    skills: string[];
    socialLinks?: any;
    karmaScore: number;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

// JWT Authentication middleware
export const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      logger.error('JWT authentication error:', err);
      return next(new CustomError('Authentication error', 500));
    }

    if (!user) {
      const message = info?.message || 'Authentication required';
      return next(new CustomError(message, 401));
    }

    req.user = user;
    next();
  })(req, res, next);
};

// Optional JWT Authentication (doesn't fail if no token)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return next();
  }

  passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
    if (err) {
      logger.error('Optional auth error:', err);
    }

    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
};

// Check if user is verified
export const requireVerified = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new CustomError('Authentication required', 401));
  }

  if (!req.user.emailVerified) {
    return next(new CustomError('Email verification required', 403));
  }

  next();
};

// Check if user is admin (based on karma score or specific role)
export const requireAdmin = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new CustomError('Authentication required', 401));
  }

  // For now, consider users with high karma as admins
  // In production, you might want a separate admin role
  if (req.user.karmaScore < 1000) {
    return next(new CustomError('Admin privileges required', 403));
  }

  next();
};

// Generate JWT tokens
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    
    if (decoded.type !== 'refresh') {
      throw new CustomError('Invalid token type', 401);
    }

    return { userId: decoded.userId };
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    throw new CustomError('Invalid refresh token', 401);
  }
};

// Rate limiting for specific user actions
export const checkUserRateLimit = (_action: string, _maxAttempts: number = 5, _windowMs: number = 15 * 60 * 1000) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new CustomError('Authentication required', 401));
    }

    // This would typically use Redis for distributed rate limiting
    // For now, we'll rely on the general rate limiter
    next();
  };
};
