import express from 'express';
import { body, query, param } from 'express-validator';
import { getDatabase } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get user's bookmark collections
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
    const collections = await prisma.bookmarkCollection.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            idea: {
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
            }
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: collections
    });

  } catch (error) {
    logger.error('Error getting bookmark collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmark collections'
    });
  }
}));

// Create a new bookmark collection
router.post('/', authenticateJWT, validate([
  body('name').isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
  body('tags.*').optional().isLength({ min: 1, max: 30 }).withMessage('Each tag must be 1-30 characters'),
  body('color').optional().isHexColor().withMessage('Color must be valid hex color'),
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const { name, description, isPublic = false, tags = [], color } = req.body;

  try {
    const collection = await prisma.bookmarkCollection.create({
      data: {
        name,
        description,
        userId,
        isPublic,
        tags,
        color
      },
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: collection,
      message: 'Collection created successfully'
    });

  } catch (error) {
    logger.error('Error creating bookmark collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bookmark collection'
    });
  }
}));

// Update a bookmark collection
router.put('/:id', authenticateJWT, validate([
  param('id').isMongoId().withMessage('Invalid collection ID'),
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
  body('isPublic').optional().isBoolean().withMessage('isPublic must be boolean'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
  body('tags.*').optional().isLength({ min: 1, max: 30 }).withMessage('Each tag must be 1-30 characters'),
  body('color').optional().isHexColor().withMessage('Color must be valid hex color'),
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const collectionId = req.params.id;
  const updates = req.body;

  try {
    // Check if collection exists and user owns it
    const existingCollection = await prisma.bookmarkCollection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!existingCollection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    const updatedCollection = await prisma.bookmarkCollection.update({
      where: { id: collectionId },
      data: updates,
      include: {
        _count: {
          select: {
            items: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedCollection,
      message: 'Collection updated successfully'
    });

  } catch (error) {
    logger.error('Error updating bookmark collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bookmark collection'
    });
  }
}));

// Delete a bookmark collection
router.delete('/:id', authenticateJWT, validate([
  param('id').isMongoId().withMessage('Invalid collection ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const collectionId = req.params.id;

  try {
    // Check if collection exists and user owns it
    const existingCollection = await prisma.bookmarkCollection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!existingCollection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await prisma.bookmarkCollection.delete({
      where: { id: collectionId }
    });

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting bookmark collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookmark collection'
    });
  }
}));

// Add idea to collection
router.post('/:id/ideas', authenticateJWT, validate([
  param('id').isMongoId().withMessage('Invalid collection ID'),
  body('ideaId').isMongoId().withMessage('Invalid idea ID'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be max 500 characters')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const collectionId = req.params.id;
  const { ideaId, notes } = req.body;

  try {
    // Check if collection exists and user owns it
    const collection = await prisma.bookmarkCollection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId }
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Check if idea is already in collection
    const existingItem = await prisma.bookmarkCollectionItem.findUnique({
      where: {
        collectionId_ideaId: {
          collectionId,
          ideaId
        }
      }
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Idea is already in this collection'
      });
    }

    // Add idea to collection
    const collectionItem = await prisma.bookmarkCollectionItem.create({
      data: {
        collectionId,
        ideaId,
        notes
      },
      include: {
        idea: {
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
        }
      }
    });

    // Also create/update regular bookmark
    await prisma.bookmark.upsert({
      where: {
        userId_ideaId: {
          userId,
          ideaId
        }
      },
      update: {},
      create: {
        userId,
        ideaId
      }
    });

    res.status(201).json({
      success: true,
      data: collectionItem,
      message: 'Idea added to collection successfully'
    });

  } catch (error) {
    logger.error('Error adding idea to collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add idea to collection'
    });
  }
}));

// Remove idea from collection
router.delete('/:id/ideas/:ideaId', authenticateJWT, validate([
  param('id').isMongoId().withMessage('Invalid collection ID'),
  param('ideaId').isMongoId().withMessage('Invalid idea ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const userId = req.user!.id;
  const collectionId = req.params.id;
  const ideaId = req.params.ideaId;

  try {
    // Check if collection exists and user owns it
    const collection = await prisma.bookmarkCollection.findFirst({
      where: {
        id: collectionId,
        userId
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Remove item from collection
    const deletedItem = await prisma.bookmarkCollectionItem.deleteMany({
      where: {
        collectionId,
        ideaId
      }
    });

    if (deletedItem.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found in collection'
      });
    }

    res.json({
      success: true,
      message: 'Idea removed from collection successfully'
    });

  } catch (error) {
    logger.error('Error removing idea from collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove idea from collection'
    });
  }
}));

// Get public collections (for discovery)
router.get('/public', validate([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('search').optional().isLength({ min: 2 }).withMessage('Search query must be at least 2 characters')
]), asyncHandler(async (req, res) => {
  const prisma = getDatabase();
  
  if (!prisma) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable'
    });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search as string;

  try {
    const where: any = {
      isPublic: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    const [collections, total] = await Promise.all([
      prisma.bookmarkCollection.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              karmaScore: true
            }
          },
          items: {
            include: {
              idea: {
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
              }
            },
            take: 3 // Show preview of first 3 ideas
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.bookmarkCollection.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        collections,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    logger.error('Error getting public collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get public collections'
    });
  }
}));

export default router;