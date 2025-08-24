import { Request, Response, NextFunction } from 'express';

// Extend Express Request type for authenticated routes
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    avatar?: string | undefined;
    bio?: string | undefined;
    skills: string[];
    socialLinks?: any;
    karmaScore: number;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | undefined;
  body: any;
}

// Handler types for Express routes
export type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type StandardHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type { Response, NextFunction };

// Environment variables type
export interface AppProcessEnv {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GEMINI_API_KEY: string;
  EMAIL_SERVICE?: string;
  EMAIL_API_KEY?: string;
  EMAIL_FROM?: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
  RATE_LIMIT_STRICT_MAX: string;
  RATE_LIMIT_AI_MAX: string;
  RATE_LIMIT_UPLOAD_MAX: string;
  UPLOAD_MAX_SIZE: string;
  UPLOAD_ALLOWED_TYPES: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppProcessEnv {}
  }
}
