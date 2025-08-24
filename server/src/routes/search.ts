import express from 'express';
import { query } from 'express-validator';
import { getDatabase } from '../config/database';
import { cacheService } from '../config/redis';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { IdeaCategory } from '@prisma/client';

const router = express.Router();

// Advanced search
router.get('/', optionalAuth, validate([
  query('q').optional().isString().isLength({ min: 2 }).withMessage('Query must be at least 2 characters'),
  query('category').optional().isIn(Object.values(IdeaCategory)).withMessage('Invalid category'),
  query('tags').optional().isString().withMessage('Tags must be a string'),
  query('author').optional().isString().withMessage('Author must be a string'),
  query('sort').optional().isIn(['relevance', 'newest', 'oldest', 'popular']).withMessage('Invalid sort option'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const q = req.query.q as string;
  const category = req.query.category as string;
  const tags = req.query.tags as string;
  const author = req.query.author as string;
  const sort = req.query.sort as string || 'relevance';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const prisma = getDatabase();

  // Generate cache key
  const cacheKey = `search:${JSON.stringify({
    q, category, tags, author, sort, page, limit
  })}`;

  try {
    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  } catch (error) {
    // Cache error, continue without cache
  }

  // Build where clause
  const where: any = {
    status: 'PUBLISHED'
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
      { tags: { hasSome: [q] } }
    ];
  }

  if (category) {
    where.category = category;
  }

  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    where.tags = { hasSome: tagArray };
  }

  if (author) {
    where.author = {
      username: { contains: author, mode: 'insensitive' }
    };
  }

  // Build orderBy clause
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
    default: // relevance
      orderBy = { voteScore: 'desc' };
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

  const formattedIdeas = ideas.map(idea => ({
    ...idea,
    userVote: req.user && idea.votes.length > 0 ? idea.votes[0].type : null,
    counts: idea._count
  }));

  const result = {
    ideas: formattedIdeas,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      query: q,
      category,
      tags: tags?.split(','),
      author,
      sort
    }
  };

  // Cache result for 5 minutes
  await cacheService.setJson(cacheKey, result, 300);

  res.json(result);
}));

// Search suggestions
router.get('/suggestions', validate([
  query('q').isString().isLength({ min: 2 }).withMessage('Query must be at least 2 characters')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = getDatabase();
  const q = req.query.q as string;
  const cacheKey = `suggestions:${q}`;
  
  const cached = await cacheService.getJson(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const [titleSuggestions, tagSuggestions, authorSuggestions] = await Promise.all([
    // Title suggestions
    prisma.idea.findMany({
      where: {
        status: 'PUBLISHED',
        title: { contains: q, mode: 'insensitive' }
      },
      select: { title: true },
      take: 5,
      orderBy: { voteScore: 'desc' }
    }),
    
    // Tag suggestions
    prisma.idea.findMany({
      where: {
        status: 'PUBLISHED',
        tags: { hasSome: [q] }
      },
      select: { tags: true },
      take: 10
    }),
    
    // Author suggestions
    prisma.user.findMany({
      where: {
        username: { contains: q, mode: 'insensitive' },
        isActive: true
      },
      select: {
        username: true,
        avatar: true,
        karmaScore: true
      },
      take: 5,
      orderBy: { karmaScore: 'desc' }
    })
  ]);

  // Extract unique tags
  const allTags = tagSuggestions.flatMap(idea => idea.tags);
  const uniqueTags = [...new Set(allTags)]
    .filter(tag => tag.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 10);

  const suggestions = {
    titles: titleSuggestions.map(idea => idea.title),
    tags: uniqueTags,
    authors: authorSuggestions
  };

  // Cache for 10 minutes
  await cacheService.setJson(cacheKey, suggestions, 600);

  res.json(suggestions);
}));

// Trending searches
router.get('/trending', asyncHandler(async (_req, res) => {
  const prisma = getDatabase();
  const cacheKey = 'trending:searches';
  
  const cached = await cacheService.getJson(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get trending tags (most used in last 7 days)
  const trendingTags = await prisma.idea.findMany({
    where: {
      status: 'PUBLISHED',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    select: { tags: true }
  });

  const tagCounts: Record<string, number> = {};
  trendingTags.forEach(idea => {
    idea.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  // Get trending categories
  const trendingCategories = await prisma.idea.groupBy({
    by: ['category'],
    where: {
      status: 'PUBLISHED',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    },
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
    take: 5
  });

  const trending = {
    tags: topTags,
    categories: trendingCategories.map(cat => ({
      category: cat.category,
      count: cat._count.category
    }))
  };

  // Cache for 1 hour
  await cacheService.setJson(cacheKey, trending, 3600);

  res.json(trending);
}));

// Popular searches
router.get('/popular', asyncHandler(async (_req, res) => {
  const prisma = getDatabase();
  const cacheKey = 'popular:searches';
  
  const cached = await cacheService.getJson(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get most popular ideas (by vote score and views)
  const popularIdeas = await prisma.idea.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      category: true,
      tags: true,
      voteScore: true,
      viewCount: true
    },
    orderBy: [
      { voteScore: 'desc' },
      { viewCount: 'desc' }
    ],
    take: 20
  });

  // Extract popular terms
  const popularTerms = new Set<string>();
  popularIdeas.forEach(idea => {
    // Add title words
    idea.title.split(' ').forEach(word => {
      if (word.length > 3) {
        popularTerms.add(word.toLowerCase());
      }
    });
    
    // Add tags
    idea.tags.forEach(tag => popularTerms.add(tag));
    
    // Add category
    popularTerms.add(idea.category.toLowerCase());
  });

  const popular = {
    terms: Array.from(popularTerms).slice(0, 20),
    ideas: popularIdeas.slice(0, 10)
  };

  // Cache for 2 hours
  await cacheService.setJson(cacheKey, popular, 7200);

  res.json(popular);
}));

export default router;
