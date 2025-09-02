# Deployment Guide

## Environment Variables Setup

### Railway (Server) Environment Variables

Set these in your Railway dashboard:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GEMINI_API_KEY=your-gemini-api-key
SENDGRID_API_KEY=your-sendgrid-api-key
CLIENT_URL=https://ideaapp-new.vercel.app
SERVER_URL=https://ideaapp-new-production.up.railway.app
CORS_ORIGIN=https://ideaapp-new.vercel.app,http://localhost:3000,http://localhost:5173
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Vercel (Client) Environment Variables

Set these in your Vercel dashboard:

```
VITE_API_URL=https://ideaapp-new-production.up.railway.app
VITE_SOCKET_URL=https://ideaapp-new-production.up.railway.app
VITE_GOOGLE_CLIENT_ID=278602552282-b91irg70a3b13amcfq8qhorjp1npijr9.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

## Deployment Steps

### 1. Update Railway Environment Variables
- Go to your Railway project dashboard
- Navigate to Variables tab
- Add all the server environment variables listed above
- Make sure `DATABASE_URL` points to your actual database

### 2. Update Vercel Environment Variables
- Go to your Vercel project dashboard
- Navigate to Settings > Environment Variables
- Add all the client environment variables listed above

### 3. Deploy Changes
- Push your code changes to GitHub
- Both Railway and Vercel should automatically redeploy

### 4. Test Deployment
- Visit your Vercel URL: https://ideaapp-new.vercel.app
- Check Railway health endpoint: https://ideaapp-new-production.up.railway.app/health
- Try registering a new account and logging in

## Common Issues & Solutions

### 1. CORS Errors
- Ensure `CORS_ORIGIN` includes your Vercel URL
- Check that `CLIENT_URL` matches your actual Vercel deployment URL

### 2. Database Connection Issues
- Verify `DATABASE_URL` is correct in Railway
- Check if your database service is running

### 3. 401/403 Authentication Errors
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Check if Google OAuth credentials are correct

### 4. Socket Connection Issues
- Ensure `VITE_SOCKET_URL` is set in Vercel
- Check Railway logs for WebSocket errors

### 5. API Calls Failing
- Verify `VITE_API_URL` matches your Railway URL
- Check Railway logs for server errors

## Debugging

### Check Railway Logs
```bash
railway logs
```

### Check Vercel Logs
- Go to Vercel dashboard > Functions tab
- View deployment logs

### Health Check Endpoints
- Server: https://ideaapp-new-production.up.railway.app/health
- Client: Check browser console for errors
