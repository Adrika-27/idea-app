@echo off
echo ==========================================
echo    RAILWAY DEPLOYMENT TROUBLESHOOTING
echo ==========================================
echo.

echo [1] CHECKING CURRENT DIRECTORY...
cd /d "c:\Users\salon\OneDrive\Desktop\ideaapp-new"
echo Current directory: %CD%
echo.

echo [2] CHECKING GIT STATUS...
git status
echo.

echo [3] COMMITTING AND PUSHING LATEST CHANGES...
git add .
git commit -m "Fix Railway deployment with proper environment setup"
git push origin main
echo.

echo [4] RAILWAY ENVIRONMENT VARIABLES NEEDED:
echo.
echo Go to: https://railway.app/dashboard
echo Find project: ideaapp-new
echo Click: Variables tab
echo Add these 8 variables:
echo.
echo DATABASE_URL=mongodb+srv://adrika_new:adrikanew@cluster0.mb2ligy.mongodb.net/hackideas?retryWrites=true^&w=majority^&appName=Cluster0
echo NODE_ENV=production
echo PORT=5000
echo JWT_SECRET=hackideas-super-secret-jwt-key-2025
echo JWT_REFRESH_SECRET=hackideas-super-secret-refresh-key-2025
echo CLIENT_URL=https://ideaapp-new.vercel.app
echo SERVER_URL=https://ideaapp-new-production.up.railway.app
echo CORS_ORIGIN=https://ideaapp-new.vercel.app,http://localhost:3000,http://localhost:5173
echo.

echo [5] AFTER SETTING VARIABLES:
echo - Railway will auto-redeploy (wait 3-5 minutes)
echo - Test: https://ideaapp-new-production.up.railway.app/health
echo - Should show: {"status":"ok"}
echo.

echo [6] TESTING LOCAL SERVER (to verify code works)...
cd server
echo Starting local server test...
node minimal-server.js
