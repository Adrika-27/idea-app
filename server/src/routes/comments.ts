import express from 'express';
import { body, query, param } from 'express-validator';
import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Get comments for an idea
router.get('/', validate([
  query('ideaId').isString().withMessage('Idea ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('sort').optional().isIn(['newest', 'oldest', 'top']).withMessage('Invalid sort option')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const { ideaId } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sort = req.query.sort as string || 'top';
  const offset = (page - 1) * limit;

  // Verify idea exists
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId as string },
    select: { id: true }
  });

  if (!idea) {
    throw new CustomError('Idea not found', 404);
  }

  // Always sort by newest first for reliability
  let orderBy: any = { createdAt: 'desc' };

  // Log the query parameters for debugging
  logger.info(`[API] Getting comments for idea ${ideaId}, page ${page}, limit ${limit}, sort ${sort}`);

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        ideaId: ideaId as string,
        isDeleted: false
      },
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
        replies: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          take: 3, // Show first 3 replies
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
            } : false
          }
        },
        votes: req.user ? {
          where: { userId: req.user.id },
          select: { type: true }
        } : false,
        _count: {
          select: {
            replies: {
              where: { isDeleted: false }
            }
          }
        }
      }
    }),
    prisma.comment.count({
      where: {
        ideaId: ideaId as string,
        isDeleted: false
      }
    })
  ]);

  // Log returned comments for debugging
  logger.info(`[API] Query executed - Found ${comments.length} comments for idea ${ideaId}, total in DB: ${total}`);
  
  // Debug: Log all comments in database for this idea (without filters)
  const allCommentsForIdea = await prisma.comment.findMany({
    where: { ideaId: ideaId as string },
    select: { id: true, content: true, isDeleted: true, parentCommentId: true, createdAt: true }
  });
  logger.info(`[API] All comments in DB for idea ${ideaId}:`, JSON.stringify(allCommentsForIdea, null, 2));
  
  if (comments.length === 0) {
    logger.warn(`[API] No comments found for idea ${ideaId}. Check DB and query logic.`);
  } else {
    logger.debug(`[API] Comments found: ${comments.map(c => `${c.id} by ${c.author.username}`).join(', ')}`);
  }

  const formattedComments = comments.map(comment => ({
    ...comment,
    userVote: req.user && comment.votes.length > 0 ? comment.votes[0].type : null,
    replies: comment.replies.map(reply => ({
      ...reply,
      userVote: req.user && reply.votes.length > 0 ? reply.votes[0].type : null
    })),
    replyCount: comment._count.replies
  }));

  res.json({
    comments: formattedComments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get replies for a comment
router.get('/:commentId/replies', validate([
  param('commentId').isString().withMessage('Comment ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const { commentId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const [replies, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        parentCommentId: commentId,
        isDeleted: false
      },
      orderBy: { createdAt: 'asc' },
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
        } : false
      }
    }),
    prisma.comment.count({
      where: {
        parentCommentId: commentId,
        isDeleted: false
      }
    })
  ]);

  const formattedReplies = replies.map(reply => ({
    ...reply,
    userVote: req.user && reply.votes.length > 0 ? reply.votes[0].type : null
  }));

  res.json({
    replies: formattedReplies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create comment
router.post('/', authenticateJWT, validate([
  body('ideaId').isString().withMessage('Idea ID is required'),
  body('content').isLength({ min: 5, max: 2000 }).withMessage('Content must be 5-2000 characters'),
  body('parentCommentId').optional().isString().withMessage('Parent comment ID must be a string')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const { ideaId, content, parentCommentId } = req.body;
  const userId = req.user!.id;

  // Verify idea exists
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: { id: true, authorId: true }
  });

  if (!idea) {
    throw new CustomError('Idea not found', 404);
  }

  // Verify parent comment exists if provided
  if (parentCommentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      select: { id: true, ideaId: true }
    });

    if (!parentComment || parentComment.ideaId !== ideaId) {
      throw new CustomError('Parent comment not found', 404);
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: userId,
      ideaId,
      parentCommentId
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

  // Update idea comment count
  await prisma.idea.update({
    where: { id: ideaId },
    data: { commentCount: { increment: 1 } }
  });

  // Create activity record
  await prisma.activity.create({
    data: {
      type: 'COMMENT_CREATED',
      userId,
      ideaId,
      commentId: comment.id
    }
  });


  // Emit real-time update
  const io = req.app.get('io');
  if (io) {
    const payload = {
      ...comment,
      userVote: null,
      replyCount: 0,
      replies: [],
      votes: []
    };
    if (parentCommentId) {
      io.broadcastToIdea(ideaId, 'comment:reply_added', {
        reply: payload,
        parentCommentId
      });
    } else {
      io.broadcastToIdea(ideaId, 'comment:added', { comment: payload });
    }
  }

  logger.info(`New comment created by ${req.user!.username} on idea ${ideaId}`);

  res.status(201).json({
    message: 'Comment created successfully',
    comment: {
      ...comment,
      userVote: null,
      replyCount: 0
    }
  });
}));

// Update comment
router.put('/:id', authenticateJWT, validate([
  param('id').isString().withMessage('Comment ID is required'),
  body('content').isLength({ min: 5, max: 2000 }).withMessage('Content must be 5-2000 characters')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;

  const existingComment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, authorId: true, isDeleted: true, ideaId: true }
  });

  if (!existingComment) {
    throw new CustomError('Comment not found', 404);
  }

  if (existingComment.isDeleted) {
    throw new CustomError('Comment has been deleted', 400);
  }

  if (existingComment.authorId !== userId) {
    throw new CustomError('Not authorized to update this comment', 403);
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { content },
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
          replies: {
            where: { isDeleted: false }
          }
        }
      }
    }
  });

  // Emit real-time update for comment edit
  const io = req.app.get('io');
  if (io) {
    const payload = {
      ...comment,
      userVote: null,
      replyCount: comment._count.replies,
      replies: [],
      votes: []
    };
    io.broadcastToIdea(existingComment.ideaId, 'comment:updated', { comment: payload });
  }

  res.json({
    message: 'Comment updated successfully',
    comment
  });
}));

// Delete comment
router.delete('/:id', authenticateJWT, validate([
  param('id').isString().withMessage('Comment ID is required')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const { id } = req.params;
  const userId = req.user!.id;

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, authorId: true, ideaId: true, isDeleted: true }
  });

  if (!comment) {
    throw new CustomError('Comment not found', 404);
  }

  if (comment.isDeleted) {
    throw new CustomError('Comment already deleted', 400);
  }

  if (comment.authorId !== userId) {
    throw new CustomError('Not authorized to delete this comment', 403);
  }

  // Soft delete
  await prisma.comment.update({
    where: { id },
    data: { 
      isDeleted: true,
      content: '[deleted]'
    }
  });

  // Update idea comment count
  await prisma.idea.update({
    where: { id: comment.ideaId },
    data: { commentCount: { decrement: 1 } }
  });

  // Emit real-time update for comment deletion
  const io = req.app.get('io');
  if (io) {
    io.broadcastToIdea(comment.ideaId, 'comment:deleted', { commentId: id });
  }

  res.json({
    message: 'Comment deleted successfully'
  });
}));

// Vote on comment
router.post('/:id/vote', authenticateJWT, validate([
  param('id').isString().withMessage('Comment ID is required'),
  body('type').isIn(['UP', 'DOWN']).withMessage('Vote type must be UP or DOWN')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const { id } = req.params;
  const { type } = req.body;
  const userId = req.user!.id;

  const comment = await prisma.comment.findUnique({
    where: { id },
    select: { id: true, authorId: true, voteScore: true, isDeleted: true, ideaId: true }
  });

  if (!comment) {
    throw new CustomError('Comment not found', 404);
  }

  if (comment.isDeleted) {
    throw new CustomError('Cannot vote on deleted comment', 400);
  }

  if (comment.authorId === userId) {
    throw new CustomError('Cannot vote on your own comment', 400);
  }

  // Check existing vote
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_commentId: {
        userId,
        commentId: id
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
        commentId: id
      }
    });
    voteScoreChange = type === 'UP' ? 1 : -1;
  }

  // Update comment vote score
  const updatedComment = await prisma.comment.update({
    where: { id },
    data: { voteScore: { increment: voteScoreChange } },
    select: { voteScore: true }
  });

  // Update author karma
  await prisma.user.update({
    where: { id: comment.authorId },
    data: { karmaScore: { increment: voteScoreChange } }
  });

  // Create activity record
  await prisma.activity.create({
    data: {
      type: 'COMMENT_VOTED',
      userId,
      commentId: id,
      data: { voteType: type }
    }
  });

  const io = req.app.get('io');
  if (io) {
    io.broadcastToIdea(comment.ideaId, 'comment:vote_updated', {
      ideaId: comment.ideaId,
      commentId: id,
      voteScore: updatedComment.voteScore,
      userVote: existingVote && existingVote.type === type ? null : type
    });
  }

  res.json({
    message: 'Vote recorded successfully',
    voteScore: updatedComment.voteScore,
    userVote: existingVote && existingVote.type === type ? null : type
  });
}));

export default router;
