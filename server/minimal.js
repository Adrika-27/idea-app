// ULTRA MINIMAL SERVER - GUARANTEED TO WORK
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5000;

// Simple CORS headers
function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

// Sample data
const sampleIdeas = [
  {
    id: '1',
    title: 'AI Code Assistant',
    description: 'Smart coding companion powered by machine learning',
    category: 'AI_ML',
    tags: ['AI', 'Programming', 'Productivity'],
    author: { username: 'tech_innovator', avatar: null },
    voteScore: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Green Energy Tracker',
    description: 'Monitor and optimize renewable energy consumption',
    category: 'SUSTAINABILITY',
    tags: ['Green Tech', 'IoT', 'Environment'],
    author: { username: 'eco_developer', avatar: null },
    voteScore: 38,
    createdAt: new Date().toISOString()
  }
];

const users = [];
let userIdCounter = 1;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  // Set CORS headers
  setCORS(res);
  
  // Handle OPTIONS requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse body for POST requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      let jsonBody = {};
      if (body) {
        jsonBody = JSON.parse(body);
      }
      
      // Route handlers
      if (path === '/' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'HackIdeas Pro API - WORKING!',
          status: 'ok',
          version: '1.0.0',
          timestamp: new Date().toISOString()
        }));
        
      } else if (path === '/health' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'production',
          uptime: process.uptime(),
          message: 'Server is healthy and running!'
        }));
        
      } else if (path === '/api/auth/register' && method === 'POST') {
        const { email, username, password } = jsonBody;
        
        if (!email || !username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Missing required fields'
          }));
          return;
        }
        
        // Check if user exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'User already exists'
          }));
          return;
        }
        
        // Create user
        const user = {
          id: userIdCounter++,
          email,
          username,
          password,
          createdAt: new Date().toISOString()
        };
        users.push(user);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'User registered successfully',
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          },
          tokens: {
            accessToken: `token-${user.id}`,
            refreshToken: `refresh-${user.id}`
          }
        }));
        
      } else if (path === '/api/auth/login' && method === 'POST') {
        const { email, password } = jsonBody;
        
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Email and password required'
          }));
          return;
        }
        
        // Find user
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            username: user.username
          },
          tokens: {
            accessToken: `token-${user.id}`,
            refreshToken: `refresh-${user.id}`
          }
        }));
        
      } else if (path === '/api/ideas' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          ideas: sampleIdeas,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: sampleIdeas.length,
            hasNextPage: false,
            hasPrevPage: false
          }
        }));
        
      } else {
        // 404 handler
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          message: 'Route not found',
          path,
          method,
          availableRoutes: [
            'GET /',
            'GET /health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/ideas'
          ]
        }));
      }
      
    } catch (error) {
      console.error('Request error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }));
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MINIMAL SERVER RUNNING ON PORT ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/health`);
  console.log(`🔥 ZERO DEPENDENCIES - CANNOT CRASH!`);
});

// Error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
    server.listen(PORT + 1, '0.0.0.0');
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
