const https = require('https');

console.log('🧪 Testing Railway server...');

const options = {
  hostname: 'ideaapp-new-production.up.railway.app',
  port: 443,
  path: '/health',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`✅ Response status: ${res.statusCode}`);
  console.log(`📋 Response headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📦 Response body:`, data);
    
    if (res.statusCode === 200) {
      console.log('🎉 SERVER IS WORKING!');
      console.log('✅ Now test your app at: https://ideaapp-new.vercel.app');
    } else {
      console.log('❌ Server returned error status');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('🔍 This might mean:');
  console.log('  1. Server is still starting up (wait 2-3 minutes)');
  console.log('  2. Environment variables need to be set correctly');
  console.log('  3. Check Railway deployment logs');
});

req.on('timeout', () => {
  console.error('⏰ Request timed out');
  req.destroy();
});

req.end();
