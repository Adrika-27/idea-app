import express from 'express';
import { body, query, param } from 'express-validator';
import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { IdeaCategory, IdeaStatus } from '@prisma/client';

const router = express.Router();

// Validation schemas
const createIdeaValidation = [
  body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('content').isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('category').isIn(Object.values(IdeaCategory)).withMessage('Invalid category'),
  body('tags').isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
  body('tags.*').isLength({ min: 2, max: 30 }).withMessage('Each tag must be 2-30 characters'),
];


// Get all ideas with filtering and pagination
router.get('/', optionalAuth, validate([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('category').optional().isIn(Object.values(IdeaCategory)).withMessage('Invalid category'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('search').optional().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'trending', 'hot']).withMessage('Invalid sort option'),
  query('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).withMessage('Invalid difficulty level'),
  query('timeCommitment').optional().isIn(['QUICK', 'SHORT', 'MEDIUM', 'LONG', 'EXTENDED']).withMessage('Invalid time commitment'),
  query('techStack').optional().isString().withMessage('Tech stack must be a string')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  // Check if database is available
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const category = req.query.category as IdeaCategory;
  const sort = req.query.sort as string || 'hot';
  const tags = req.query.tags as string;
  const search = req.query.search as string;
  const difficulty = req.query.difficulty as string;
  const timeCommitment = req.query.timeCommitment as string;
  const techStack = req.query.techStack as string;

  // Build where clause (include all ideas regardless of status)
  const where: any = {};

  if (category) {
    where.category = category;
  }

  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    where.tags = {
      hasSome: tagArray
    };
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (timeCommitment) {
    where.timeCommitment = timeCommitment;
  }

  if (techStack) {
    const techStackArray = techStack.split(',').map(tech => tech.trim());
    where.OR = where.OR || [];
    where.OR.push(
      { techStack: { hasSome: techStackArray } },
      { aiTechStack: { hasSome: techStackArray } }
    );
  }

  if (search) {
    const searchConditions = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } }
    ];
    
    if (where.OR) {
      // If we already have OR conditions from techStack, combine them
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions }
      ];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  // Build order by clause
  let orderBy: any = {};
  switch (sort) {
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'popular':
      orderBy = { voteScore: 'desc' };
      break;
    case 'trending':
      // Simple trending algorithm based on recent activity
      orderBy = [
        { voteScore: 'desc' },
        { createdAt: 'desc' }
      ];
      break;
    default: // hot
      orderBy = [
        { voteScore: 'desc' },
        { commentCount: 'desc' },
        { viewCount: 'desc' }
      ];
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      orderBy,
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
        votes: req.user ? {
          where: { userId: req.user.id },
          select: { type: true }
        } : false,
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

  // Format response
  const formattedIdeas = ideas.map(idea => ({
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    tags: idea.tags,
    author: idea.author,
    voteScore: idea.voteScore,
    viewCount: idea.viewCount,
    commentCount: idea.commentCount,
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    userVote: req.user && idea.votes.length > 0 ? idea.votes[0].type : null,
    counts: idea._count,
    images: idea.images
  }));

  res.json({
    ideas: formattedIdeas,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      category,
      tags: tags?.split(','),
      search,
      sort
    }
  });
}));

// Get single idea
router.get('/:id', optionalAuth, validate([
  param('id').isString().withMessage('Invalid idea ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const prisma = getDatabase();

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          bio: true,
          karmaScore: true,
          createdAt: true
        }
      },
      votes: req.user ? {
        where: { userId: req.user.id },
        select: { type: true }
      } : false,
      bookmarks: req.user ? {
        where: { userId: req.user.id },
        select: { id: true }
      } : false,
      _count: {
        select: {
          votes: true,
          comments: true,
          bookmarks: true
        }
      }
    }
  });

  if (!idea) {
    throw new CustomError('Idea not found', 404);
  }

  if (idea.status !== IdeaStatus.PUBLISHED && (!req.user || req.user.id !== idea.authorId)) {
    throw new CustomError('Idea not found', 404);
  }

  // Increment view count (only once per user per session)
  if (req.user && req.user.id !== idea.authorId) {
    await prisma.idea.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
  }

  const formattedIdea = {
    ...idea,
    userVote: req.user && idea.votes.length > 0 ? idea.votes[0].type : null,
    isBookmarked: req.user && idea.bookmarks.length > 0,
    counts: idea._count
  };

  res.json({ idea: formattedIdea });
}));

// Create new idea
router.post('/', authenticateJWT, validate(createIdeaValidation), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { title, description, content, category, tags } = req.body;
  const authorId = req.user!.id;
  const prisma = getDatabase();

  const idea = await prisma.idea.create({
    data: {
      title,
      description,
      content,
      category,
      tags: tags || [],
      authorId,
      publishedAt: null
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          karmaScore: true
        }
      }
    }
  });

  // Create activity record
  await prisma.activity.create({
    data: {
      type: 'IDEA_CREATED',
      userId: authorId,
      ideaId: idea.id
    }
  });

  logger.info(`New idea created: ${idea.title} by ${req.user!.username}`);

  res.status(201).json({
    message: 'Idea created successfully',
    idea
  });
}));

// Update idea
router.put('/:id', authenticateJWT, validate([
  param('id').isString().withMessage('Invalid idea ID'),
  ...createIdeaValidation
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, content, category, tags, status } = req.body;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const existingIdea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true, authorId: true, status: true }
  });

  if (!existingIdea) {
    throw new CustomError('Idea not found', 404);
  }

  if (existingIdea.authorId !== userId) {
    throw new CustomError('Not authorized to update this idea', 403);
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (tags !== undefined) updateData.tags = tags;
  if (status !== undefined) {
    updateData.status = status;
    if (status === IdeaStatus.PUBLISHED && existingIdea.status !== IdeaStatus.PUBLISHED) {
      updateData.publishedAt = new Date();
    }
  }

  const idea = await prisma.idea.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          karmaScore: true
        }
      }
    }
  });

  // Create activity record and broadcast if published
  if (status === IdeaStatus.PUBLISHED && existingIdea.status !== IdeaStatus.PUBLISHED) {
    await prisma.activity.create({
      data: {
        type: 'IDEA_PUBLISHED',
        userId,
        ideaId: idea.id
      }
    });

    // Emit a global event for the new idea
    const io = req.app.get('io');
    if (io) {
      io.emit('idea:new', { idea });
    }
  }

  logger.info(`Idea updated: ${idea.title} by ${req.user!.username}`);

  // Emit socket event for idea update
  const io = req.app.get('io');
  if (io) {
    io.emit('idea:updated', { idea });
  }

  res.json({
    message: 'Idea updated successfully',
    idea
  });
}));

// Delete idea
router.delete('/:id', authenticateJWT, validate([
  param('id').isString().withMessage('Invalid idea ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true, authorId: true, title: true }
  });

  if (!idea) {
    throw new CustomError('Idea not found', 404);
  }

  if (idea.authorId !== userId) {
    throw new CustomError('Not authorized to delete this idea', 403);
  }

  await prisma.idea.delete({
    where: { id }
  });

  logger.info(`Idea deleted: ${idea.title} by ${req.user!.username}`);

  // Emit socket event for idea deletion
  const io = req.app.get('io');
  if (io) {
    io.emit('idea:deleted', { ideaId: id, title: idea.title });
  }

  res.json({
    message: 'Idea deleted successfully'
  });
}));

// Vote on idea
router.post('/:id/vote', authenticateJWT, validate([
  param('id').isString().withMessage('Invalid idea ID'),
  body('type').isIn(['UP', 'DOWN']).withMessage('Vote type must be UP or DOWN')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true, authorId: true, voteScore: true }
  });

  if (!idea) {
    throw new CustomError('Idea not found', 404);
  }

  if (idea.authorId === userId) {
    throw new CustomError('Cannot vote on your own idea', 400);
  }

  // Check existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId: id
      }
    }
  });

  let voteScoreChange = 0;

  if (existingVote) {
    if (existingVote.type === type) {
      // Remove vote
      await prisma.vote.delete({
        where: { id: existingVote.id }
      });
      voteScoreChange = type === 'UP' ? -1 : 1;
    } else {
      // Change vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type }
      });
      voteScoreChange = type === 'UP' ? 2 : -2;
    }
  } else {
    // Create new vote
    await prisma.vote.create({
      data: {
        type,
        userId,
        ideaId: id
      }
    });
    voteScoreChange = type === 'UP' ? 1 : -1;
  }

  // Update idea vote score
  const updatedIdea = await prisma.idea.update({
    where: { id },
    data: { voteScore: { increment: voteScoreChange } },
    select: { voteScore: true }
  });

  // Update author karma
  await prisma.user.update({
    where: { id: idea.authorId },
    data: { karmaScore: { increment: voteScoreChange } }
  });

  // Create activity record
  await prisma.activity.create({
    data: {
      type: 'IDEA_VOTED',
      userId,
      ideaId: id,
      data: { voteType: type }
    }
  });

  // Emit real-time update
  const io = req.app.get('io');
  if (io) {
    io.broadcastToIdea(id, 'vote:updated', {
      ideaId: id,
      voteScore: updatedIdea.voteScore,
      userVote: existingVote && existingVote.type === type ? null : type
    });
  }

  res.json({
    message: 'Vote recorded successfully',
    voteScore: updatedIdea.voteScore,
    userVote: existingVote && existingVote.type === type ? null : type
  });
}));

// Toggle bookmark on an idea
router.post('/:id/bookmark', authenticateJWT, validate([
  param('id').isString().withMessage('Invalid idea ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const idea = await prisma.idea.findUnique({
    where: { id },
    select: { id: true }
  });

  if (!idea) {
    throw new CustomError('Idea not found', 404);
  }

  const existingBookmark = await prisma.bookmark.findUnique({
    where: {
      userId_ideaId: {
        userId,
        ideaId: id
      }
    }
  });

  if (existingBookmark) {
    await prisma.bookmark.delete({
      where: { id: existingBookmark.id }
    });

    res.json({
      message: 'Bookmark removed',
      isBookmarked: false
    });
  } else {
    await prisma.bookmark.create({
      data: {
        userId,
        ideaId: id
      }
    });

    await prisma.activity.create({
      data: {
        type: 'BOOKMARK_ADDED',
        userId,
        ideaId: id
      }
    });

    res.json({
      message: 'Idea bookmarked',
      isBookmarked: true
    });
  }
}));

export default router;
