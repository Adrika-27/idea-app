import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType;

export async function initializeRedis(): Promise<RedisClientType | null> {
  try {
    // Skip Redis if URL is not provided
    if (!process.env.REDIS_URL) {
      logger.info('⚠️ Redis URL not provided, skipping Redis initialization');
      return null;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    logger.info('⚠️ Continuing without Redis (caching disabled)');
    return null;
  }
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.disconnect();
      logger.info('Redis disconnected');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient || null;
}

// Cache utilities
export class CacheService {
  private client: RedisClientType | null = null;

  private getClient(): RedisClientType | null {
    if (!this.client) {
      this.client = getRedisClient();
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      const client = this.getClient();
      if (!client) return null;
      return await client.get(key);
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;
      if (ttlSeconds) {
        await client.setEx(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;
      await client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    try {
      const client = this.getClient();
      if (!client) return 0;
      const result = await client.incr(key);
      if (ttlSeconds && result === 1) {
        await client.expire(key, ttlSeconds);
      }
      return result;
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const client = this.getClient();
      if (!client) return null;
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache getJson error for key ${key}:`, error);
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.set(key, jsonValue, ttlSeconds);
    } catch (error) {
      logger.error(`Cache setJson error for key ${key}:`, error);
      return false;
    }
  }
}

export const cacheService = new CacheService();
