// DIRECT TEST OF RAILWAY REGISTRATION
const https = require('https');

const testData = {
  email: 'adrika-test@example.com',
  username: 'adrika-test',
  password: 'testpass123'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'idea-app-production.up.railway.app',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Origin': 'https://ideaapp-new.vercel.app'
  }
};

console.log('🧪 Testing Railway registration endpoint...');
console.log('📧 Email:', testData.email);
console.log('👤 Username:', testData.username);
console.log('🔗 URL: https://idea-app-production.up.railway.app/api/auth/register');
console.log('');

const req = https.request(options, (res) => {
  console.log(`✅ Status Code: ${res.statusCode}`);
  console.log('📊 Headers:', res.headers);
  console.log('');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 Response:');
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (jsonResponse.user && jsonResponse.tokens) {
        console.log('');
        console.log('🎉 SUCCESS! Registration worked!');
        console.log('👤 User created:', jsonResponse.user.username);
        console.log('🔑 Token received:', !!jsonResponse.tokens.accessToken);
      }
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.write(postData);
req.end();
