import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { getRedisClient } from '../config/redis';

// Create a custom store using Redis
class RedisStore {
  private client = getRedisClient();
  private prefix = 'rl:';

  async increment(key: string): Promise<{ totalHits: number; resetTime?: Date }> {
    const redisKey = this.prefix + key;
    const windowMs = parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10);
    const maxRequests = parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10);

    try {
      if (!this.client) {
        return { totalHits: 1 };
      }
      
      const current = await this.client.incr(redisKey);
      
      if (current === 1) {
        await this.client.expire(redisKey, Math.ceil(windowMs / 1000));
      }

      const ttl = await this.client.ttl(redisKey);
      const resetTime = new Date(Date.now() + (ttl * 1000));

      return {
        totalHits: current,
        resetTime: current > maxRequests ? resetTime : undefined
      };
    } catch (error) {
      logger.error('Redis rate limiter error:', error);
      // Fallback to allowing the request if Redis fails
      return { totalHits: 1 };
    }
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    try {
      if (!this.client) return;
      await this.client.decr(redisKey);
    } catch (error) {
      logger.error('Redis rate limiter decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = this.prefix + key;
    try {
      if (!this.client) return;
      await this.client.del(redisKey);
    } catch (error) {
      logger.error('Redis rate limiter reset error:', error);
    }
  }
}

// General rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    const user = (req as any).user;
    return user ? `user:${user.id}` : `ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10) / 1000)
    });
  }
});

// Strict rate limiter for sensitive endpoints
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many attempts, please try again later.',
    retryAfter: 900 // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user ? `strict:user:${user.id}` : `strict:ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Strict rate limit exceeded for ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      error: 'Too many attempts',
      message: 'Too many attempts. Please try again in 15 minutes.',
      retryAfter: 900
    });
  }
});

// AI endpoint rate limiter
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 AI requests per hour
  message: {
    error: 'AI rate limit exceeded',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user ? `ai:user:${user.id}` : `ai:ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`AI rate limit exceeded for ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      error: 'AI rate limit exceeded',
      message: 'Too many AI requests. Please try again in an hour.',
      retryAfter: 3600
    });
  }
});

// Upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per window
  message: {
    error: 'Upload rate limit exceeded',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore() as any,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    return user ? `upload:user:${user.id}` : `upload:ip:${req.ip}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn(`Upload rate limit exceeded for ${req.ip}`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    
    res.status(429).json({
      error: 'Upload rate limit exceeded',
      message: 'Too many upload attempts. Please try again later.',
      retryAfter: 900
    });
  }
});
