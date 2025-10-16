import express from 'express';
import { body } from 'express-validator';
import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Define enums
enum IdeaCategory {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  AI_ML = 'AI_ML',
  BLOCKCHAIN = 'BLOCKCHAIN',
  IOT = 'IOT',
  GAME_DEV = 'GAME_DEV',
  DATA_SCIENCE = 'DATA_SCIENCE',
  CYBERSECURITY = 'CYBERSECURITY',
  DEVTOOLS = 'DEVTOOLS',
  FINTECH = 'FINTECH',
  HEALTHTECH = 'HEALTHTECH',
  EDTECH = 'EDTECH',
  SOCIAL = 'SOCIAL',
  ECOMMERCE = 'ECOMMERCE',
  PRODUCTIVITY = 'PRODUCTIVITY',
  OTHER = 'OTHER',
}

enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

enum TimeCommitment {
  QUICK = 'QUICK',
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  EXTENDED = 'EXTENDED'
}

// Get user preferences
router.get('/', authenticateJWT, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;

  try {
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    // If no preferences exist, return default preferences
    if (!preferences) {
      const defaultPreferences = {
        preferredCategories: [],
        preferredTechStack: [],
        preferredDifficulty: [],
        preferredTimeCommitment: [],
        enableRecommendations: true,
        enableTrending: true,
        recommendationWeight: {}
      };

      res.json({
        success: true,
        data: defaultPreferences
      });
      return;
    }

    res.json({
      success: true,
      data: preferences
    });

  } catch (error) {
    logger.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user preferences'
    });
  }
}));

// Update user preferences
router.put('/', authenticateJWT, validate([
  body('preferredCategories').optional().isArray().withMessage('Preferred categories must be an array'),
  body('preferredCategories.*').optional().isIn(Object.values(IdeaCategory)).withMessage('Invalid category'),
  body('preferredTechStack').optional().isArray().withMessage('Preferred tech stack must be an array'),
  body('preferredTechStack.*').optional().isString().isLength({ min: 1, max: 50 }).withMessage('Each tech must be 1-50 characters'),
  body('preferredDifficulty').optional().isArray().withMessage('Preferred difficulty must be an array'),
  body('preferredDifficulty.*').optional().isIn(Object.values(DifficultyLevel)).withMessage('Invalid difficulty level'),
  body('preferredTimeCommitment').optional().isArray().withMessage('Preferred time commitment must be an array'),
  body('preferredTimeCommitment.*').optional().isIn(Object.values(TimeCommitment)).withMessage('Invalid time commitment'),
  body('enableRecommendations').optional().isBoolean().withMessage('Enable recommendations must be boolean'),
  body('enableTrending').optional().isBoolean().withMessage('Enable trending must be boolean'),
  body('recommendationWeight').optional().isObject().withMessage('Recommendation weight must be an object')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const {
    preferredCategories,
    preferredTechStack,
    preferredDifficulty,
    preferredTimeCommitment,
    enableRecommendations,
    enableTrending,
    recommendationWeight
  } = req.body;

  try {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...(preferredCategories !== undefined && { preferredCategories }),
        ...(preferredTechStack !== undefined && { preferredTechStack }),
        ...(preferredDifficulty !== undefined && { preferredDifficulty }),
        ...(preferredTimeCommitment !== undefined && { preferredTimeCommitment }),
        ...(enableRecommendations !== undefined && { enableRecommendations }),
        ...(enableTrending !== undefined && { enableTrending }),
        ...(recommendationWeight !== undefined && { recommendationWeight })
      },
      create: {
        userId,
        preferredCategories: preferredCategories || [],
        preferredTechStack: preferredTechStack || [],
        preferredDifficulty: preferredDifficulty || [],
        preferredTimeCommitment: preferredTimeCommitment || [],
        enableRecommendations: enableRecommendations !== undefined ? enableRecommendations : true,
        enableTrending: enableTrending !== undefined ? enableTrending : true,
        recommendationWeight: recommendationWeight || {}
      }
    });

    res.json({
      success: true,
      data: preferences,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user preferences'
    });
  }
}));

// Reset user preferences to defaults
router.delete('/', authenticateJWT, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;

  try {
    await prisma.userPreferences.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Preferences reset to defaults'
    });

  } catch (error) {
    logger.error('Error resetting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset user preferences'
    });
  }
}));

// Get available options for preferences
router.get('/options', asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      categories: Object.values(IdeaCategory),
      difficultyLevels: Object.values(DifficultyLevel),
      timeCommitments: Object.values(TimeCommitment),
      commonTechStack: [
        'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js',
        'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET',
        'PHP', 'Laravel', 'Ruby', 'Rails', 'Go', 'Rust', 'Swift',
        'Kotlin', 'Flutter', 'React Native', 'MongoDB', 'PostgreSQL',
        'MySQL', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
        'REST API', 'Machine Learning', 'TensorFlow', 'PyTorch',
        'Blockchain', 'Solidity', 'Web3', 'Next.js', 'Nuxt.js',
        'Express.js', 'FastAPI', 'Firebase', 'Supabase'
      ]
    }
  });
}));

export default router;