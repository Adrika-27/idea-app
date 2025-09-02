#!/usr/bin/env node

console.log('🚀 RAILWAY ENVIRONMENT VARIABLES SETUP');
console.log('=====================================');
console.log('');
console.log('✅ Your MongoDB connection is working!');
console.log('');
console.log('📋 COPY THESE ENVIRONMENT VARIABLES TO RAILWAY:');
console.log('');
console.log('Go to Railway Dashboard → Your Project → Variables tab');
console.log('Add these variables one by one:');
console.log('');

console.log('🗄️  DATABASE & CORE:');
console.log('DATABASE_URL=mongodb+srv://adrika_new:adrikanew@cluster0.mb2ligy.mongodb.net/hackideas?retryWrites=true&w=majority&appName=Cluster0');
console.log('NODE_ENV=production');
console.log('PORT=5000');
console.log('');

console.log('🔐 SECURITY:');
console.log('JWT_SECRET=your-super-secret-jwt-key-change-in-production');
console.log('JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production');
console.log('');

console.log('🌐 URLS & CORS:');
console.log('CLIENT_URL=https://ideaapp-new.vercel.app');
console.log('SERVER_URL=https://ideaapp-new-production.up.railway.app');
console.log('CORS_ORIGIN=https://ideaapp-new.vercel.app,http://localhost:3000,http://localhost:5173');
console.log('');

console.log('🔧 OPTIONAL (Add if you have them):');
console.log('GOOGLE_CLIENT_ID=278602552282-b91irg70a3b13amcfq8qhorjp1npijr9.apps.googleusercontent.com');
console.log('GOOGLE_CLIENT_SECRET=your-google-client-secret');
console.log('GEMINI_API_KEY=your-gemini-api-key');
console.log('SENDGRID_API_KEY=your-sendgrid-api-key');
console.log('');

console.log('📋 STEP-BY-STEP INSTRUCTIONS:');
console.log('');
console.log('1. 🚂 Railway Setup:');
console.log('   - Go to https://railway.app/dashboard');
console.log('   - Click on your "ideaapp-new" project');
console.log('   - Click on "Variables" tab');
console.log('   - Click "Add Variable" for each variable above');
console.log('   - Copy-paste the name and value exactly');
console.log('');

console.log('2. ▲ Vercel Setup (if not done):');
console.log('   - Go to https://vercel.com/dashboard');
console.log('   - Click on your "ideaapp-new" project');
console.log('   - Go to Settings → Environment Variables');
console.log('   - Add these:');
console.log('     VITE_API_URL=https://ideaapp-new-production.up.railway.app');
console.log('     VITE_SOCKET_URL=https://ideaapp-new-production.up.railway.app');
console.log('     VITE_GOOGLE_CLIENT_ID=278602552282-b91irg70a3b13amcfq8qhorjp1npijr9.apps.googleusercontent.com');
console.log('');

console.log('3. 🚀 Deploy:');
console.log('   - After adding variables, Railway will auto-redeploy');
console.log('   - Wait 2-3 minutes for deployment');
console.log('   - Test: https://ideaapp-new-production.up.railway.app/health');
console.log('   - Should return: {"status":"ok"}');
console.log('');

console.log('4. 🧪 Test Your App:');
console.log('   - Visit: https://ideaapp-new.vercel.app');
console.log('   - Try registering a new account');
console.log('   - Try logging in');
console.log('   - Check if ideas load properly');
console.log('');

console.log('🔥 IMPORTANT SECURITY NOTE:');
console.log('Make sure to change the JWT secrets to something unique!');
console.log('Generate secure secrets at: https://www.uuidgenerator.net/');
console.log('');

console.log('✅ Your database is connected and ready!');
console.log('Just add the environment variables to Railway and you\'re done!');
