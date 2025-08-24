import express from 'express';
import { query, param } from 'express-validator';
import { getDatabase } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = express.Router();

// Get user notifications
router.get('/', authenticateJWT, validate([
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
  query('unread').optional().isBoolean().withMessage('Unread must be a boolean')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const unread = req.query.unread === 'true';
  const prisma = getDatabase();

  const where: any = { userId };
  if (unread) {
    where.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, isRead: false }
    })
  ]);

  res.json({
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    unreadCount
  });
}));

// Mark notification as read
router.put('/:id/read', authenticateJWT, validate([
  param('id').isString().withMessage('Invalid notification ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true, isRead: true }
  });

  if (!notification) {
    throw new CustomError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new CustomError('Not authorized', 403);
  }

  if (notification.isRead) {
    return res.json({ message: 'Notification already read' });
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  res.json({ message: 'Notification marked as read' });
}));

// Mark all notifications as read
router.put('/mark-all-read', authenticateJWT, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const prisma = getDatabase();

  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });

  res.json({
    message: 'All notifications marked as read',
    count: result.count
  });
}));

// Delete notification
router.delete('/:id', authenticateJWT, validate([
  param('id').isString().withMessage('Invalid notification ID')
]), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const prisma = getDatabase();

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true }
  });

  if (!notification) {
    throw new CustomError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new CustomError('Not authorized', 403);
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({ message: 'Notification deleted' });
}));

// Get notification stats
router.get('/stats', authenticateJWT, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const prisma = getDatabase();

  const stats = await prisma.notification.groupBy({
    by: ['type'],
    where: { userId },
    _count: { type: true }
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false }
  });

  res.json({
    stats: stats.map(stat => ({
      type: stat.type,
      count: stat._count.type
    })),
    unreadCount
  });
}));

export default router;
