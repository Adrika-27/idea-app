import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger';
import { getDatabase } from './database';

// Remove unused interface - using inline type instead

export function initializeSocket(io: Server): void {
  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const prisma = getDatabase();
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, avatar: true, isActive: true }
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket & { userId?: string; user?: { id: string; username: string; avatar?: string; } }) => {
    logger.info(`User ${socket.user?.username} connected with socket ${socket.id}`);

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`);

    // Handle joining idea rooms for real-time updates
    socket.on('join:idea', (ideaId: string) => {
      socket.join(`idea:${ideaId}`);
      logger.debug(`User ${socket.userId} joined idea room: ${ideaId}`);
    });

    socket.on('leave:idea', (ideaId: string) => {
      socket.leave(`idea:${ideaId}`);
      logger.debug(`User ${socket.userId} left idea room: ${ideaId}`);
    });

    // Handle real-time voting
    socket.on('vote:cast', (data: { ideaId: string; type: 'UP' | 'DOWN' }) => {
      // Broadcast vote update to all users in the idea room
      socket.to(`idea:${data.ideaId}`).emit('vote:updated', {
        ideaId: data.ideaId,
        userId: socket.userId,
        type: data.type,
        timestamp: new Date().toISOString()
      });
    });

    // Handle real-time comments
    socket.on('comment:new', (data: { ideaId: string; commentId: string; content: string }) => {
      socket.to(`idea:${data.ideaId}`).emit('comment:added', {
        ideaId: data.ideaId,
        commentId: data.commentId,
        author: socket.user,
        content: data.content,
        timestamp: new Date().toISOString()
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (data: { ideaId: string }) => {
      socket.to(`idea:${data.ideaId}`).emit('user:typing', {
        userId: socket.userId,
        username: socket.user?.username,
        ideaId: data.ideaId
      });
    });

    socket.on('typing:stop', (data: { ideaId: string }) => {
      socket.to(`idea:${data.ideaId}`).emit('user:stopped_typing', {
        userId: socket.userId,
        ideaId: data.ideaId
      });
    });

    // Handle user presence
    socket.on('presence:online', () => {
      socket.broadcast.emit('user:online', {
        userId: socket.userId,
        username: socket.user?.username
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      logger.info(`User ${socket.user?.username} disconnected: ${reason}`);
      
      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        username: socket.user?.username
      });
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      logger.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Global socket utilities
  io.sendNotification = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
  };

  io.broadcastToIdea = (ideaId: string, event: string, data: any) => {
    io.to(`idea:${ideaId}`).emit(event, data);
  };

  io.broadcastToAll = (event: string, data: any) => {
    io.emit(event, data);
  };

  logger.info('✅ Socket.IO initialized successfully');
}

// Extend Socket.IO Server interface
declare module 'socket.io' {
  interface Server {
    sendNotification(userId: string, notification: any): void;
    broadcastToIdea(ideaId: string, event: string, data: any): void;
    broadcastToAll(event: string, data: any): void;
  }
}
