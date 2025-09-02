const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Prisma initialization failed:', error);
}

// Middleware
app.use(cors({
  origin: ['https://ideaapp-new.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  try {
    let dbStatus = 'disconnected';
    if (prisma) {
      await prisma.$connect();
      dbStatus = 'connected';
    }
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      version: '1.0.0'
    });
  } catch (error) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'error',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HackIdeas Pro API is running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      ideas: '/api/ideas'
    }
  });
});

// Simple auth register
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        emailVerified: true // Skip verification for now
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

// Simple auth login
app.post('/api/auth/login', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Get ideas
app.get('/api/ideas', async (req, res) => {
  try {
    if (!prisma) {
      return res.status(503).json({ success: false, message: 'Database unavailable' });
    }

    const ideas = await prisma.idea.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, avatar: true }
        }
      }
    });

    res.json({
      success: true,
      ideas,
      total: ideas.length
    });

  } catch (error) {
    console.error('Ideas fetch error:', error);
    // Return empty array instead of error for frontend
    res.json({
      success: true,
      ideas: [],
      total: 0,
      message: 'No ideas available yet'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/', '/health', '/api/auth/register', '/api/auth/login', '/api/ideas']
  });
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for production domains`);
  
  // Test database connection
  if (prisma) {
    try {
      await prisma.$connect();
      console.log(`✅ Database connected successfully`);
    } catch (error) {
      console.log(`❌ Database connection failed: ${error.message}`);
    }
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (prisma) await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  if (prisma) await prisma.$disconnect();
  process.exit(0);
});
