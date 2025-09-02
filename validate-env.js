#!/usr/bin/env node

// Environment validation script for deployment
// Run this script to check if all required environment variables are set

const requiredServerEnvs = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
  'SERVER_URL'
];

const optionalServerEnvs = [
  'REDIS_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'SENDGRID_API_KEY',
  'CORS_ORIGIN'
];

const requiredClientEnvs = [
  'VITE_API_URL'
];

const optionalClientEnvs = [
  'VITE_SOCKET_URL',
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_GITHUB_CLIENT_ID'
];

console.log('🔍 Validating Environment Variables...\n');

// Check if running in server or client context
const isServer = process.env.DATABASE_URL !== undefined || process.argv.includes('--server');
const isClient = process.env.VITE_API_URL !== undefined || process.argv.includes('--client');

if (isServer) {
  console.log('📡 SERVER ENVIRONMENT VALIDATION');
  console.log('================================');
  
  let missingRequired = [];
  let missingOptional = [];
  
  requiredServerEnvs.forEach(env => {
    if (process.env[env]) {
      console.log(`✅ ${env}: Set`);
    } else {
      console.log(`❌ ${env}: Missing (REQUIRED)`);
      missingRequired.push(env);
    }
  });
  
  optionalServerEnvs.forEach(env => {
    if (process.env[env]) {
      console.log(`✅ ${env}: Set`);
    } else {
      console.log(`⚠️  ${env}: Missing (optional)`);
      missingOptional.push(env);
    }
  });
  
  if (missingRequired.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingRequired.join(', ')}`);
    process.exit(1);
  } else {
    console.log('\n✅ All required server environment variables are set!');
  }
}

if (isClient) {
  console.log('\n🌐 CLIENT ENVIRONMENT VALIDATION');
  console.log('================================');
  
  let missingRequired = [];
  let missingOptional = [];
  
  requiredClientEnvs.forEach(env => {
    if (process.env[env]) {
      console.log(`✅ ${env}: ${process.env[env]}`);
    } else {
      console.log(`❌ ${env}: Missing (REQUIRED)`);
      missingRequired.push(env);
    }
  });
  
  optionalClientEnvs.forEach(env => {
    if (process.env[env]) {
      console.log(`✅ ${env}: ${process.env[env]}`);
    } else {
      console.log(`⚠️  ${env}: Missing (optional)`);
      missingOptional.push(env);
    }
  });
  
  if (missingRequired.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingRequired.join(', ')}`);
    process.exit(1);
  } else {
    console.log('\n✅ All required client environment variables are set!');
  }
}

if (!isServer && !isClient) {
  console.log('ℹ️  Run with --server or --client flag to validate specific environment');
  console.log('   or set environment variables and run again');
}

console.log('\n📋 DEPLOYMENT CHECKLIST');
console.log('=======================');
console.log('1. ✅ Set environment variables in Railway dashboard');
console.log('2. ✅ Set environment variables in Vercel dashboard');
console.log('3. ✅ Update CORS origins to include your Vercel URL');
console.log('4. ✅ Test API endpoints: /health and /api/auth/register');
console.log('5. ✅ Test client can connect to server');
console.log('\n🚀 Ready for deployment!');
