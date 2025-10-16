import express from 'express';
import { query } from 'express-validator';
import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

// Define enums directly since they may not be exported yet
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

const router = express.Router();

// Get AI-powered recommendations for a user
router.get('/ideas', authenticateJWT, validate([
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('category').optional().isIn(Object.values(IdeaCategory)).withMessage('Invalid category'),
  query('difficulty').optional().isIn(Object.values(DifficultyLevel)).withMessage('Invalid difficulty'),
  query('timeCommitment').optional().isIn(Object.values(TimeCommitment)).withMessage('Invalid time commitment'),
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const limit = parseInt(req.query.limit as string) || 10;
  const categoryFilter = req.query.category as IdeaCategory;
  const difficultyFilter = req.query.difficulty as DifficultyLevel;
  const timeCommitmentFilter = req.query.timeCommitment as TimeCommitment;

  try {
    // Get user preferences
    const userWithPreferences = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        activities: {
          where: {
            type: { in: ['IDEA_VOTED', 'IDEA_CREATED', 'BOOKMARK_ADDED'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        votes: {
          where: { type: 'UP' },
          include: { idea: true }
        }
      }
    });

    if (!userWithPreferences) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build recommendation criteria based on user data
    const recommendationCriteria = await buildRecommendationCriteria(
      userWithPreferences,
      categoryFilter,
      difficultyFilter,
      timeCommitmentFilter
    );

    // Get recommended ideas
    const recommendations = await getRecommendedIdeas(
      prisma,
      userId,
      recommendationCriteria,
      limit
    );

    // Calculate recommendation scores and sort
    const scoredRecommendations = await scoreRecommendations(
      recommendations,
      userWithPreferences
    );

    res.json({
      success: true,
      data: {
        recommendations: scoredRecommendations.slice(0, limit),
        criteria: recommendationCriteria,
        total: recommendations.length
      }
    });

  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
}));

// Get trending topics
router.get('/trending', validate([
  query('period').optional().isIn(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).withMessage('Invalid period'),
  query('category').optional().isIn(Object.values(IdeaCategory)).withMessage('Invalid category'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
]), asyncHandler(async (req, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const period = req.query.period as string || 'DAILY';
  const category = req.query.category as IdeaCategory;
  const limit = parseInt(req.query.limit as string) || 20;

  try {
    // Get trending topics (for now, we'll calculate them on the fly)
    // In the future, this could be pre-calculated and stored in TrendingTopic model
    const trendingTopics: any[] = [];

    // Get trending ideas based on trending score
    const timeWindow = getTimeWindow(period);
    const trendingIdeas = await prisma.idea.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: timeWindow
        },
        ...(category && { category })
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            karmaScore: true
          }
        },
        _count: {
          select: {
            votes: true,
            comments: true,
            bookmarks: true
          }
        }
      },
        orderBy: [
        { voteScore: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    res.json({
      success: true,
      data: {
        topics: trendingTopics,
        ideas: trendingIdeas,
        period,
        category
      }
    });

  } catch (error) {
    logger.error('Error getting trending data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending data'
    });
  }
}));

// Helper functions
async function buildRecommendationCriteria(user: any, categoryFilter?: IdeaCategory, difficultyFilter?: DifficultyLevel, timeCommitmentFilter?: TimeCommitment) {
  const criteria: any = {};

  // Use user preferences if available
  if (user.preferences) {
    if (user.preferences.preferredCategories?.length > 0) {
      criteria.categories = user.preferences.preferredCategories;
    }
    if (user.preferences.preferredTechStack?.length > 0) {
      criteria.techStack = user.preferences.preferredTechStack;
    }
    if (user.preferences.preferredDifficulty?.length > 0) {
      criteria.difficulty = user.preferences.preferredDifficulty;
    }
    if (user.preferences.preferredTimeCommitment?.length > 0) {
      criteria.timeCommitment = user.preferences.preferredTimeCommitment;
    }
  }

  // Analyze user activity to infer preferences
  const activityBasedPreferences = analyzeUserActivity(user.activities, user.votes);
  
  // Merge activity-based preferences with explicit preferences
  if (!criteria.categories && activityBasedPreferences.categories?.length > 0) {
    criteria.categories = activityBasedPreferences.categories;
  }
  if (!criteria.techStack && activityBasedPreferences.techStack?.length > 0) {
    criteria.techStack = activityBasedPreferences.techStack;
  }

  // Apply filters
  if (categoryFilter) {
    criteria.categories = [categoryFilter];
  }
  if (difficultyFilter) {
    criteria.difficulty = [difficultyFilter];
  }
  if (timeCommitmentFilter) {
    criteria.timeCommitment = [timeCommitmentFilter];
  }

  // Fallback to user skills if no other preferences
  if (!criteria.techStack && user.skills?.length > 0) {
    criteria.techStack = user.skills;
  }

  return criteria;
}

function analyzeUserActivity(_activities: any[], votes: any[]) {
  const preferences: any = {
    categories: [],
    techStack: []
  };

  // Analyze voted ideas
  const votedIdeas = votes.map(v => v.idea).filter(Boolean);
  
  // Count category preferences from votes
  const categoryCount: { [key: string]: number } = {};
  const techStackCount: { [key: string]: number } = {};

  votedIdeas.forEach(idea => {
    if (idea.category) {
      categoryCount[idea.category] = (categoryCount[idea.category] || 0) + 1;
    }
    if (idea.techStack) {
      idea.techStack.forEach((tech: string) => {
        techStackCount[tech] = (techStackCount[tech] || 0) + 1;
      });
    }
    if (idea.aiTechStack) {
      idea.aiTechStack.forEach((tech: string) => {
        techStackCount[tech] = (techStackCount[tech] || 0) + 1;
      });
    }
  });

  // Get top categories and tech stack
  preferences.categories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category]) => category);

  preferences.techStack = Object.entries(techStackCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tech]) => tech);

  return preferences;
}

async function getRecommendedIdeas(prisma: any, userId: string, criteria: any, limit: number) {
  const where: any = {
    status: 'PUBLISHED',
    authorId: { not: userId }, // Don't recommend user's own ideas
  };

  // Apply criteria filters
  if (criteria.categories?.length > 0) {
    where.category = { in: criteria.categories };
  }
  if (criteria.difficulty?.length > 0) {
    where.difficulty = { in: criteria.difficulty };
  }
  if (criteria.timeCommitment?.length > 0) {
    where.timeCommitment = { in: criteria.timeCommitment };
  }
  if (criteria.techStack?.length > 0) {
    where.OR = [
      { techStack: { hasSome: criteria.techStack } },
      { aiTechStack: { hasSome: criteria.techStack } },
      { tags: { hasSome: criteria.techStack } }
    ];
  }

  // Get ideas that user hasn't bookmarked or voted on
  const userBookmarks = await prisma.bookmark.findMany({
    where: { userId },
    select: { ideaId: true }
  });

  const userVotes = await prisma.vote.findMany({
    where: { userId },
    select: { ideaId: true }
  });

  const excludeIds = [
    ...userBookmarks.map((b: any) => b.ideaId),
    ...userVotes.map((v: any) => v.ideaId)
  ].filter(Boolean);

  if (excludeIds.length > 0) {
    where.id = { notIn: excludeIds };
  }

  const ideas = await prisma.idea.findMany({
    where,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          karmaScore: true
        }
      },
      _count: {
        select: {
          votes: true,
          comments: true,
          bookmarks: true
        }
      }
    },
    orderBy: [
      { voteScore: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit * 3 // Get more ideas for better scoring
  });

  return ideas;
}

async function scoreRecommendations(ideas: any[], user: any) {
  return ideas.map(idea => {
    let score = 0;

    // Base score from engagement metrics
    score += idea.voteScore * 0.3;
    score += idea.viewCount * 0.1;
    score += idea._count.comments * 0.2;
    score += idea._count.bookmarks * 0.4;

    // Boost score based on user preferences
    if (user.preferences?.preferredCategories?.includes(idea.category)) {
      score += 10;
    }

    // Tech stack matching
    const userTechStack = [
      ...(user.skills || []),
      ...(user.preferences?.preferredTechStack || [])
    ];
    
    const ideaTechStack = [
      ...(idea.techStack || []),
      ...(idea.aiTechStack || []),
      ...(idea.tags || [])
    ];

    const techMatches = userTechStack.filter(tech => 
      ideaTechStack.some(idTech => 
        idTech.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(idTech.toLowerCase())
      )
    );

    score += techMatches.length * 5;

    // Recency boost
    const daysSincePublished = idea.publishedAt 
      ? (Date.now() - new Date(idea.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
    
    if (daysSincePublished < 7) {
      score += 5;
    } else if (daysSincePublished < 30) {
      score += 2;
    }

    // Author karma boost
    score += (idea.author.karmaScore / 1000) * 2;

    return {
      ...idea,
      recommendationScore: score
    };
  }).sort((a, b) => b.recommendationScore - a.recommendationScore);
}

function getTimeWindow(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'HOURLY':
      return new Date(now.getTime() - 60 * 60 * 1000);
    case 'DAILY':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case 'WEEKLY':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'MONTHLY':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

export default router;