# HackIdeas Pro

A full-stack idea sharing platform built with React, TypeScript, Node.js, and MongoDB.

## Features

- User authentication with Google/GitHub OAuth
- Create, share, and vote on ideas
- Real-time comments and notifications
- AI-powered categorization
- Search and filtering
- User profiles and karma system

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Socket.io  
**Backend:** Node.js, Express, Prisma, MongoDB, Redis  
**Auth:** JWT, Passport.js, OAuth

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/Adrika-27/idea-app.git
   cd idea-app
   cd server && npm install
   cd ../client && npm install
   ```

2. **Setup environment**
   
   Create `server/.env`:
   ```env
   DATABASE_URL="mongodb://localhost:27017/hackideas"
   JWT_SECRET="your-jwt-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   PORT=5000
   ```
   
   Create `client/.env`:
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

3. **Setup database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

4. **Start development**
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev
   
   # Terminal 2 - Client  
   cd client && npm run dev
   ```

Visit http://localhost:5173

## Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

**Server:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run prisma:studio` - Open Prisma Studio

## License

MIT
