# HackIdeas Pro - Production-Ready Hackathon & Project Ideas Platform

A full-stack web application for hackathon and project ideas with real-time interactions, AI-powered enhancements, and social features.

## 🚀 Features

### Core Features
- **Multi-provider Authentication**: Google OAuth + email/password
- **Idea Management**: Rich text editor, categories, tags, drafts, AI enhancement
- **Social Features**: Voting, nested comments, following, bookmarking
- **Real-time Updates**: Live votes, comments, notifications via WebSocket
- **Advanced Search**: Filtering, sorting, personalized recommendations
- **User Dashboard**: Analytics, management, activity feeds

### Tech Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, Zustand, Socket.io
- **Backend**: Node.js + Express, MongoDB, Prisma ORM, Redis
- **Real-time**: Socket.io for WebSocket connections
- **AI**: Google Gemini API integration
- **Security**: JWT, OAuth, rate limiting, input validation
- **DevOps**: Docker, comprehensive logging, health checks


### Development Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd hackideas-pro
npm run install:all
```

2. **Environment Setup**
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. **Database Setup**
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

4. **Start Development Servers**
```bash
npm run dev
```

Visit `http://localhost:3000` for the frontend and `http://localhost:5000` for the API.


## 📚 API Documentation

API documentation is available at `/api/docs` when running the server.


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
