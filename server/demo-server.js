const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Simple in-memory storage for demo (replace with real DB later)
let users = [];
let ideas = [
  {
    id: '1',
    title: 'AI-Powered Code Review Tool',
    description: 'Automated code review using machine learning',
    content: 'A comprehensive tool that uses AI to analyze code quality, suggest improvements, and detect potential bugs.',
    category: 'AI_ML',
    tags: ['AI', 'Code Review', 'Machine Learning'],
    author: { id: '1', username: 'demo_user', avatar: null },
    voteScore: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Blockchain Voting System',
    description: 'Secure voting platform using blockchain technology',
    content: 'A decentralized voting system that ensures transparency and prevents fraud using blockchain.',
    category: 'BLOCKCHAIN',
    tags: ['Blockchain', 'Voting', 'Security'],
    author: { id: '2', username: 'crypto_dev', avatar: null },
    voteScore: 23,
    createdAt: new Date().toISOString()
  }
];
let currentUserId = 3;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman, etc)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://ideaapp-new.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all for demo
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: 'in-memory',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HackIdeas Pro API is running',
    status: 'ok',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      register: '/api/auth/register',
      login: '/api/auth/login',
      ideas: '/api/ideas'
    }
  });
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Create user
    const user = {
      id: currentUserId.toString(),
      email,
      username,
      password, // In real app, hash this!
      avatar: null,
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    currentUserId++;

    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      tokens: {
        accessToken: 'demo-token-' + user.id,
        refreshToken: 'demo-refresh-' + user.id
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Return user without password
    const { password: _, ...userResponse } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken: 'demo-token-' + user.id,
        refreshToken: 'demo-refresh-' + user.id
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// Get ideas
app.get('/api/ideas', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedIdeas = ideas.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      ideas: paginatedIdeas,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(ideas.length / limit),
        totalItems: ideas.length,
        hasNextPage: endIndex < ideas.length,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Ideas fetch error:', error);
    res.json({
      success: true,
      ideas: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

// Create idea
app.post('/api/ideas', (req, res) => {
  try {
    const { title, description, content, category, tags } = req.body;
    
    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and content are required'
      });
    }

    const idea = {
      id: (ideas.length + 1).toString(),
      title,
      description,
      content,
      category: category || 'OTHER',
      tags: tags || [],
      author: { id: '1', username: 'demo_user', avatar: null },
      voteScore: 0,
      createdAt: new Date().toISOString()
    };
    
    ideas.unshift(idea); // Add to beginning
    
    res.status(201).json({
      success: true,
      message: 'Idea created successfully',
      idea
    });

  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create idea'
    });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: '1',
      email: 'demo@example.com',
      username: 'demo_user',
      avatar: null
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/health',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/ideas'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DEMO SERVER RUNNING ON PORT ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔥 READY FOR DEMO!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
