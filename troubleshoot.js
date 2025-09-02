// DEPLOYMENT TROUBLESHOOTING GUIDE

console.log('🔍 RAILWAY DEPLOYMENT TROUBLESHOOTING\n');

console.log('1. CHECK RAILWAY DASHBOARD:');
console.log('   - Go to railway.app');
console.log('   - Open your ideaapp project');  
console.log('   - Check if deployment is "Active" (green)');
console.log('   - Look for any error messages');
console.log('');

console.log('2. CHECK RAILWAY URL:');
console.log('   - In Railway dashboard, click on your service');
console.log('   - Look for the "Domain" section');
console.log('   - Copy the actual URL (might be different from ideaapp-new-production.up.railway.app)');
console.log('');

console.log('3. CHECK ENVIRONMENT VARIABLES:');
console.log('   - You have 6 variables set ✅');
console.log('   - DATABASE_URL ✅');
console.log('   - JWT_SECRET ✅');  
console.log('   - JWT_REFRESH_SECRET ✅');
console.log('   - CLIENT_URL ✅');
console.log('   - SERVER_URL ✅');
console.log('   - NODE_ENV ✅');
console.log('');

console.log('4. CHECK DEPLOYMENT LOGS:');
console.log('   - In Railway dashboard, go to "Deployments" tab');
console.log('   - Click on the latest deployment');
console.log('   - Check the build and runtime logs for errors');
console.log('');

console.log('5. COMMON ISSUES:');
console.log('   ❌ Server not starting (check logs)');
console.log('   ❌ Wrong Railway URL');
console.log('   ❌ Environment variables not loading');
console.log('   ❌ Build failing');
console.log('');

console.log('🚀 ONCE YOU HAVE THE CORRECT URL:');
console.log('   1. Replace the URL in vercel.json');
console.log('   2. Test the /health endpoint');
console.log('   3. Test registration');
console.log('');

console.log('💡 TIP: The Railway URL should end with .railway.app');
console.log('   Example: your-app-name-production-abcd123.up.railway.app');
