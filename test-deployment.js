#!/usr/bin/env node
// TEST SCRIPT - Verify your deployment works end-to-end

const https = require('https');

const RAILWAY_URL = 'https://ideaapp-new-production.up.railway.app';
const VERCEL_URL = 'https://ideaapp-new.vercel.app'; // Update with your actual Vercel URL

console.log('🧪 TESTING YOUR DEPLOYMENT...\n');

// Test function
function testEndpoint(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': VERCEL_URL
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('1. 🏥 Testing health endpoint...');
  try {
    const health = await testEndpoint(`${RAILWAY_URL}/health`);
    console.log(`   ✅ Status: ${health.status}`);
    console.log(`   📊 Response:`, health.data);
    console.log();
  } catch (error) {
    console.log(`   ❌ Health check failed:`, error.message);
    return;
  }

  console.log('2. 🔐 Testing registration...');
  try {
    const register = await testEndpoint(`${RAILWAY_URL}/api/auth/register`, 'POST', {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      password: 'testpass123'
    });
    console.log(`   ✅ Status: ${register.status}`);
    if (register.data.user) {
      console.log(`   👤 User created: ${register.data.user.username}`);
      console.log(`   🔑 Token received: ${register.data.tokens ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ❌ Registration response:`, register.data);
    }
    console.log();
  } catch (error) {
    console.log(`   ❌ Registration failed:`, error.message);
  }

  console.log('3. 💡 Testing ideas endpoint...');
  try {
    const ideas = await testEndpoint(`${RAILWAY_URL}/api/ideas`);
    console.log(`   ✅ Status: ${ideas.status}`);
    console.log(`   💡 Ideas count: ${ideas.data.ideas?.length || 0}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ Ideas endpoint failed:`, error.message);
  }

  console.log('4. 🌐 Testing CORS...');
  try {
    const corsTest = await testEndpoint(`${RAILWAY_URL}/`, 'OPTIONS');
    const corsHeaders = corsTest.headers['access-control-allow-origin'];
    console.log(`   ✅ CORS header: ${corsHeaders}`);
    console.log();
  } catch (error) {
    console.log(`   ❌ CORS test failed:`, error.message);
  }

  console.log('🎉 TESTING COMPLETE!');
  console.log('\n📝 NEXT STEPS:');
  console.log('1. Your Railway server should be working at:', RAILWAY_URL);
  console.log('2. Update your Vercel environment variables if needed');
  console.log('3. Test registration from your frontend');
  console.log('4. Check browser console for any CORS errors');
}

runTests().catch(console.error);
