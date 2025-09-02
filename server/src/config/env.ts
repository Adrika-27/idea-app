import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables first
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GEMINI_API_KEY?: string;
  EMAIL_FROM: string;
  SENDGRID_API_KEY?: string;
  CLIENT_URL: string;
  SERVER_URL: string;
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  BCRYPT_ROUNDS: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  LOG_FILE: string;
}

export function validateEnv(): EnvConfig {
  // Make all environment variables optional with defaults
  logger.info('Validating environment variables with defaults...');

  const config: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: parseInt(process.env.PORT || '5000', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/hackideas',
    REDIS_URL: process.env.REDIS_URL || '',
    JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@hackideas.com',
    SENDGRID_API_KEY: process.env['SENDGRID_API_KEY'],
    CLIENT_URL: process.env['CLIENT_URL'] || 'https://ideaapp-new.vercel.app',
    SERVER_URL: process.env['SERVER_URL'] || 'https://ideaapp-new-production.up.railway.app',
    MAX_FILE_SIZE: parseInt(process.env['MAX_FILE_SIZE'] || '5242880', 10),
    UPLOAD_PATH: process.env['UPLOAD_PATH'] || './uploads',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    BCRYPT_ROUNDS: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://ideaapp-new.vercel.app,http://localhost:3000,http://localhost:5173',
    LOG_LEVEL: process.env['LOG_LEVEL'] || 'info',
    LOG_FILE: process.env['LOG_FILE'] || 'logs/app.log'
  };

  // Log warnings for missing optional configs but don't fail
  if (config.GOOGLE_CLIENT_ID && !config.GOOGLE_CLIENT_SECRET) {
    logger.warn('Google Client ID provided but Google Client Secret is missing');
  }
  
  if (!config.GEMINI_API_KEY) {
    logger.warn('Gemini API key not provided - AI features will be disabled');
  }

  if (!config.SENDGRID_API_KEY) {
    logger.warn('SendGrid API key not provided - email features will be disabled');
  }

  logger.info('Environment validation completed successfully with defaults');
  return config;
}

// Don't export env to avoid module-level execution
// Use validateEnv() function directly where needed
