import express from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { cacheService } from '../config/redis';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { strictRateLimiter } from '../middleware/rateLimiter';
import { authenticateJWT, generateTokens, verifyRefreshToken } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Validation schemas
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

// Register
router.post('/register', strictRateLimiter, validate(registerValidation), asyncHandler(async (req: any, res: any) => {
  const prisma = getDatabase();
  
  // Check if database is available
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const { email, username, password } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === email) {
      throw new CustomError('Email already registered', 409);
    }
    throw new CustomError('Username already taken', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10));

  // Generate email verification token
  const emailVerifyToken = uuidv4();

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      emailVerifyToken,
    },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      emailVerified: true,
      createdAt: true
    }
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Store refresh token in cache
  await cacheService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7 days

  logger.info(`User registered: ${user.username}`);

  res.status(201).json({
    message: 'User registered successfully',
    user,
    tokens: {
      accessToken,
      refreshToken
    },
    requiresVerification: true
  });
}));

// Login
router.post('/login', strictRateLimiter, validate(loginValidation), asyncHandler(async (req: any, res: any, next: any) => {
  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      // Do NOT throw here; pass the error to Express to avoid unhandled rejection
      return next(new CustomError(info?.message || 'Invalid email or password', 401));
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token in cache
    await cacheService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    logger.info(`User logged in: ${user.username} (${user.email})`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        karmaScore: user.karmaScore,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  })(req, res, next);
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: any, res: any) => {
  const prisma = getDatabase();
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new CustomError('Refresh token is required', 400);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const userId = decoded.userId;

  // Check if refresh token exists in cache
  const cachedToken = await cacheService.get(`refresh_token:${userId}`);
  if (!cachedToken || cachedToken !== refreshToken) {
    throw new CustomError('Invalid refresh token', 401);
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, isActive: true }
  });

  if (!user || !user.isActive) {
    throw new CustomError('User not found or inactive', 401);
  }

  // Generate new tokens
  const tokens = generateTokens(user.id);

  // Update refresh token in cache
  await cacheService.set(`refresh_token:${user.id}`, tokens.refreshToken, 7 * 24 * 60 * 60);

  res.json({
    message: 'Token refreshed successfully',
    tokens
  });
}));

// Logout
router.put('/logout', authenticateJWT as any, asyncHandler(async (req: any, res: any) => {
  const userId = req.user!.id;

  // Remove refresh token from cache
  await cacheService.del(`refresh_token:${userId}`);

  logger.info(`User logged out: ${req.user!.username}`);

  res.json({
    message: 'Logout successful'
  });
}));

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  asyncHandler(async (req: any, res: any) => {
    const user = req.user;
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);
    
    // Store refresh token
    await cacheService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);
    
    // Redirect to frontend with user data and tokens
    const clientUrl = process.env['CLIENT_URL'];
    const userQuery = encodeURIComponent(JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      karmaScore: user.karmaScore,
      createdAt: user.createdAt
    }));
    const accessTokenQuery = encodeURIComponent(accessToken);
    const refreshTokenQuery = encodeURIComponent(refreshToken);

    res.redirect(`${clientUrl}/auth/callback?success=true&user=${userQuery}&accessToken=${accessTokenQuery}&refreshToken=${refreshTokenQuery}`);
  })
);

// Verify email
router.post('/verify-email', asyncHandler(async (req: any, res: any) => {
  const prisma = getDatabase();
  const { token } = req.body;

  // Find user with verification token
  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token }
  });

  if (!user) {
    throw new CustomError('Invalid verification token', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null
    }
  });

  logger.info(`Email verified for user: ${user.username}`);

  res.json({
    message: 'Email verified successfully'
  });
}));

// Forgot password
router.post('/forgot-password', strictRateLimiter, validate(forgotPasswordValidation), asyncHandler(async (req: any, res: any) => {
  const prisma = getDatabase();
  const { email } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    // Don't reveal if email exists
    res.json({
      message: 'If the email exists, a password reset link has been sent'
    });
    return;
  }

  const resetToken = uuidv4();
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    }
  });

  // TODO: Send email with reset link
  logger.info(`Password reset requested for: ${user.email}`);

  res.json({
    message: 'If the email exists, a password reset link has been sent'
  });
}));

// Reset password
router.post('/reset-password', strictRateLimiter, validate([
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must be at least 8 characters with uppercase, lowercase, and number')
]), asyncHandler(async (req: any, res: any) => {
  const prisma = getDatabase();
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new CustomError('Invalid or expired reset token', 400);
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  logger.info(`Password reset completed for: ${user.email}`);

  res.json({
    message: 'Password reset successful'
  });
}));

// Get current user
router.get('/me', authenticateJWT as any, asyncHandler(async (req: any, res: any) => {
  const prisma = getDatabase();
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      bio: true,
      skills: true,
      socialLinks: true,
      karmaScore: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ideas: true
        }
      }
    }
  });

  res.json({
    user
  });
}));

export default router;
