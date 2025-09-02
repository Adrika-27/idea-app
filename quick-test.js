// Quick test script for your Railway deployment
const https = require('https');

const RAILWAY_URL = 'https://ideaapp-new-production.up.railway.app';

console.log('🧪 Testing Railway deployment...\n');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${RAILWAY_URL}${path}`;
    console.log(`Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response:`, data);
        console.log('---');
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.log(`Error:`, error.message);
      console.log('---');
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('Request timed out');
      console.log('---');
      reject(new Error('Timeout'));
    });
  });
}

async function runTests() {
  try {
    await testEndpoint('/');
    await testEndpoint('/health');
  } catch (error) {
    console.log('Test failed:', error.message);
  }
}

runTests();
