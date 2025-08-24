import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Import configurations and middleware
import { logger } from './config/logger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { validateEnv } from './config/env';
import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { initializePassport } from './config/passport';
import { initializeSocket } from './config/socket';

// Routes will be imported after database initialization

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.production') });

// Validate environment variables
validateEnv();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize external services
    await initializeDatabase();
    await initializeRedis();
    
    logger.info('Database and Redis initialized successfully');

    // Import routes AFTER database is initialized
    const authRoutes = require('./routes/auth').default;
    const userRoutes = require('./routes/user-fixed').default;
    const ideaRoutes = require('./routes/ideas').default;
    const commentRoutes = require('./routes/comments').default;
    const searchRoutes = require('./routes/search').default;
    const notificationRoutes = require('./routes/notifications').default;
    const uploadRoutes = require('./routes/upload').default;
    const aiRoutes = require('./routes/ai').default;

    // Create Express app and server AFTER database initialization
    const app = express();
    const server = createServer(app);
    const allowedOrigins = (process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']);

    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        credentials: true
      }
    });
    
    // Security middleware
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
    
    app.use(cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    
    // General middleware
    app.use(compression());
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Rate limiting
    app.use('/api', rateLimiter);
    
    // Initialize Passport
    initializePassport(app);
    
    // Initialize Socket.IO
    initializeSocket(io);
    
    // Make io available to routes
    app.set('io', io);
    
    // Static file serving
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    
    // Health check endpoint
    app.get('/health', (_req: any, res: any) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });
    
    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/ideas', ideaRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/ai', aiRoutes);
    
    // API documentation
    app.get('*', (_req: any, res: any) => {
      res.json({
        name: 'HackIdeas Pro API',
        version: '1.0.0',
        description: 'Production-ready hackathon and project ideas platform API',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          ideas: '/api/ideas',
          comments: '/api/comments',
          search: '/api/search',
          notifications: '/api/notifications',
          upload: '/api/upload',
          ai: '/api/ai'
        },
        documentation: 'Visit /api/docs/swagger for detailed API documentation'
      });
    });
    
    // Error handling middleware
    app.use(notFound);
    app.use(errorHandler);
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();
