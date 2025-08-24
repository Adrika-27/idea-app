import express from 'express';
import { body, query, param } from 'express-validator';
import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Get user profile
router.get('/:username', optionalAuth, validate([
  param('username').isLength({ min: 3, max: 30 }).withMessage('Invalid username')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { username } = req.params;
  const prisma = getDatabase();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar: true,
      bio: true,
      skills: true,
      socialLinks: true,
      karmaScore: true,
      createdAt: true,
      _count: {
        select: {
          ideas: { where: { status: 'PUBLISHED' } },
          followers: true,
          following: true
        }
      }
    }
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Check if current user is following this user
  let isFollowing = false;
  if (req.user && req.user.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: user.id
        }
      }
    });
    isFollowing = !!follow;
  }

  res.json({
    user: {
      ...user,
      isFollowing,
      isOwnProfile: req.user?.id === user.id
    }
  });
}));

// Get user's ideas
router.get('/:username/ideas', optionalAuth, validate([
  param('username').isLength({ min: 3, max: 30 }).withMessage('Invalid username'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('status').optional().isIn(['PUBLISHED', 'DRAFT', 'ARCHIVED']).withMessage('Invalid status')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { username } = req.params;
  const prisma = getDatabase();
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string;
  const offset = (page - 1) * limit;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
  });

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const where: any = { authorId: user.id };
  
  // Only show published ideas to non-owners
  if (!req.user || req.user.id !== user.id) {
    where.status = 'PUBLISHED';
  } else if (status) {
    where.status = status;
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
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
      }
    }),
    prisma.idea.count({ where })
  ]);

  const formattedIdeas = ideas.map(idea => ({
    ...idea,
    counts: idea._count
  }));

  res.json({
    ideas: formattedIdeas,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Update user profile
router.put('/profile', authenticateJWT, validate([
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be max 500 characters'),
  body('skills').optional().isArray({ max: 20 }).withMessage('Maximum 20 skills allowed'),
  body('skills.*').optional().isLength({ min: 2, max: 50 }).withMessage('Each skill must be 2-50 characters'),
  body('socialLinks').optional().isObject().withMessage('Social links must be an object'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { bio, skills, socialLinks, avatar } = req.body;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const updateData: any = {};
  if (bio !== undefined) updateData.bio = bio;
  if (skills !== undefined) updateData.skills = skills;
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
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
      updatedAt: true
    }
  });

  logger.info(`User profile updated: ${user.username}`);

  res.json({
    message: 'Profile updated successfully',
    user
  });
}));

export default router;
