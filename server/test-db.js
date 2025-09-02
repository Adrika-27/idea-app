// Test MongoDB connection
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testConnection() {
  const DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://adrika_new:adrikanew@cluster0.mb2ligy.mongodb.net/hackideas?retryWrites=true&w=majority&appName=Cluster0';
  
  console.log('🔌 Testing MongoDB connection...');
  console.log('Database URL:', DATABASE_URL.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Current user count: ${userCount}`);
    
    console.log('🚀 Database is ready for Railway deployment!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if MongoDB Atlas cluster is running');
    console.log('2. Verify username/password in connection string');
    console.log('3. Ensure IP whitelist includes 0.0.0.0/0');
    console.log('4. Check if database name is correct');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
