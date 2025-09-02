@echo off
title Railway Debugging Script
echo.
echo ==========================================
echo    RAILWAY SERVER DEBUGGING
echo ==========================================
echo.

echo [STEP 1] Testing Railway server connection...
curl -w "HTTP Status: %%{http_code}\nTime: %%{time_total}s\n" https://ideaapp-new-production.up.railway.app/health
echo.

echo [STEP 2] Testing Railway root endpoint...
curl -w "HTTP Status: %%{http_code}\nTime: %%{time_total}s\n" https://ideaapp-new-production.up.railway.app/
echo.

echo [STEP 3] Testing Railway API endpoint...
curl -w "HTTP Status: %%{http_code}\nTime: %%{time_total}s\n" https://ideaapp-new-production.up.railway.app/api/auth/register
echo.

echo [STEP 4] Testing Vercel frontend...
curl -w "HTTP Status: %%{http_code}\nTime: %%{time_total}s\n" https://ideaapp-new.vercel.app/
echo.

echo ==========================================
echo    DEBUGGING RESULTS
echo ==========================================
echo.

echo If you see:
echo   - 200 status codes = WORKING ✅
echo   - 502/503 status codes = Server not responding ❌
echo   - Connection errors = Network issues ❌
echo.

echo Next steps based on results:
echo   - If 200: Your app should work! ✅
echo   - If 502: Check Railway logs for errors
echo   - If 503: Server still starting up, wait 2-3 minutes
echo   - If connection error: Check Railway deployment status
echo.

pause
