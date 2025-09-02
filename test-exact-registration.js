// EXACT FRONTEND SIMULATION TEST
const https = require('https');

const testRegistration = () => {
  const userData = {
    email: 'saloniadrika@gmail.com',
    username: 'adrika',
    password: 'yourpassword' // Use the same password you're entering
  };

  const postData = JSON.stringify(userData);

  const options = {
    hostname: 'idea-app-production.up.railway.app',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'https://ideaapp-new.vercel.app',
      'User-Agent': 'Mozilla/5.0 (Frontend simulation)'
    }
  };

  console.log('🧪 TESTING EXACT REGISTRATION CALL...');
  console.log('📧 Email:', userData.email);
  console.log('👤 Username:', userData.username);
  console.log('🔗 URL: https://idea-app-production.up.railway.app/api/auth/register');
  console.log('🌐 Origin: https://ideaapp-new.vercel.app');
  console.log('');

  const req = https.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 201) {
      console.log('✅ SUCCESS - Registration should work!');
    } else if (res.statusCode === 409) {
      console.log('⚠️  User already exists (this is normal if you tested before)');
    } else {
      console.log('❌ Error status code');
    }

    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📝 Response:', response);
        
        if (response.message && response.message.includes('already')) {
          console.log('');
          console.log('💡 TIP: User already exists. Try with different email/username');
        }
      } catch (e) {
        console.log('📝 Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Network Error:', e.message);
    console.log('🔍 This might indicate a connection issue');
  });

  req.setTimeout(10000, () => {
    console.log('⏰ Request timed out - server might be slow');
    req.destroy();
  });

  req.write(postData);
  req.end();
};

testRegistration();
