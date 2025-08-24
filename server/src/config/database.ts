import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

export async function initializeDatabase(): Promise<PrismaClient> {
  try {
    if (process.env.NODE_ENV === 'production') {
      prisma = new PrismaClient({
        log: ['error', 'warn'],
      });
    } else {
      // In development, use a global variable to prevent multiple instances
      if (!global.__prisma) {
        global.__prisma = new PrismaClient({
          log: ['query', 'info', 'warn', 'error'],
        });
      }
      prisma = global.__prisma;
    }

    // Test the connection with timeout
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ]);
    
    logger.info('✅ Database connected successfully');
    return prisma;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    logger.warn('Continuing without database - some features will be disabled');
    // Don't throw error, return a mock client or handle gracefully
    return prisma;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma?.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

export function getDatabase(): PrismaClient {
  if (!prisma) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prisma;
}

// Export prisma instance
export { prisma };
