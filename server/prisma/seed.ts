import { PrismaClient, IdeaCategory, IdeaStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        username: 'alice_dev',
        password: hashedPassword,
        bio: 'Full-stack developer passionate about AI and web technologies',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AI/ML'],
        emailVerified: true,
        karmaScore: 150,
        socialLinks: {
          github: 'https://github.com/alice_dev',
          linkedin: 'https://linkedin.com/in/alice-dev'
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        username: 'bob_mobile',
        password: hashedPassword,
        bio: 'Mobile app developer with expertise in React Native and Flutter',
        skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
        emailVerified: true,
        karmaScore: 200,
        socialLinks: {
          github: 'https://github.com/bob_mobile'
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        username: 'charlie_blockchain',
        password: hashedPassword,
        bio: 'Blockchain enthusiast and smart contract developer',
        skills: ['Solidity', 'Web3', 'Ethereum', 'DeFi', 'Smart Contracts'],
        emailVerified: true,
        karmaScore: 300,
        socialLinks: {
          github: 'https://github.com/charlie_blockchain',
          twitter: 'https://twitter.com/charlie_blockchain'
        }
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample ideas
  const ideas = await Promise.all([
    prisma.idea.create({
      data: {
        title: 'AI-Powered Code Review Assistant',
        description: 'An intelligent tool that analyzes code quality, suggests improvements, and catches potential bugs using machine learning.',
        content: `# AI-Powered Code Review Assistant

## Overview
This project aims to create an intelligent code review assistant that leverages machine learning to provide automated code analysis, quality assessment, and improvement suggestions.

## Key Features
- **Automated Code Analysis**: Scan code for potential bugs, security vulnerabilities, and performance issues
- **Style Consistency**: Ensure code follows established style guidelines and best practices
- **Learning Capabilities**: Improve suggestions based on team preferences and historical data
- **Multi-Language Support**: Support for JavaScript, Python, Java, C++, and more
- **IDE Integration**: Seamless integration with popular IDEs like VS Code, IntelliJ, and Sublime Text

## Technical Implementation
- **Backend**: Python with TensorFlow/PyTorch for ML models
- **Frontend**: React-based dashboard for review management
- **API**: RESTful API for IDE integrations
- **Database**: PostgreSQL for storing analysis results and user preferences

## Impact
This tool could significantly reduce code review time while improving code quality across development teams.`,
        category: IdeaCategory.AI_ML,
        tags: ['AI', 'Machine Learning', 'Code Review', 'Developer Tools', 'Automation'],
        status: IdeaStatus.PUBLISHED,
        authorId: users[0].id,
        voteScore: 25,
        viewCount: 150,
        commentCount: 8,
        publishedAt: new Date('2024-01-15T10:00:00Z'),
        aiTechStack: ['Python', 'TensorFlow', 'React', 'PostgreSQL', 'Docker'],
        aiComplexity: 'Advanced'
      }
    }),
    prisma.idea.create({
      data: {
        title: 'Sustainable Habit Tracker Mobile App',
        description: 'A gamified mobile app that helps users build sustainable habits while contributing to environmental causes.',
        content: `# Sustainable Habit Tracker Mobile App

## Concept
Combine personal habit tracking with environmental impact to create a meaningful and engaging user experience.

## Core Features
- **Habit Tracking**: Track daily habits like water consumption, exercise, reading
- **Environmental Impact**: Show how habits contribute to sustainability goals
- **Gamification**: Points, badges, and leaderboards to maintain engagement
- **Community Challenges**: Group challenges for environmental causes
- **Impact Visualization**: Charts showing personal and collective environmental impact

## Monetization
- Freemium model with premium features
- Partnerships with eco-friendly brands
- Carbon offset marketplace integration

## Technical Stack
- React Native for cross-platform development
- Firebase for backend services
- Redux for state management
- Chart.js for data visualization`,
        category: IdeaCategory.MOBILE,
        tags: ['Mobile App', 'Sustainability', 'Gamification', 'Health', 'Environment'],
        status: IdeaStatus.PUBLISHED,
        authorId: users[1].id,
        voteScore: 18,
        viewCount: 95,
        commentCount: 5,
        publishedAt: new Date('2024-01-20T14:30:00Z'),
        aiTechStack: ['React Native', 'Firebase', 'Redux', 'Chart.js'],
        aiComplexity: 'Intermediate'
      }
    }),
    prisma.idea.create({
      data: {
        title: 'Decentralized Freelancer Marketplace',
        description: 'A blockchain-based platform that connects freelancers with clients without intermediary fees.',
        content: `# Decentralized Freelancer Marketplace

## Problem Statement
Traditional freelancer platforms charge high fees (15-20%) and have centralized control over payments and disputes.

## Solution
Create a decentralized marketplace using blockchain technology to eliminate intermediaries and reduce costs.

## Key Features
- **Smart Contracts**: Automated payment release based on milestone completion
- **Reputation System**: Blockchain-based reputation that follows users across platforms
- **Dispute Resolution**: Decentralized arbitration system
- **Multi-Currency Support**: Accept payments in various cryptocurrencies
- **Skill Verification**: NFT-based skill certificates

## Technical Architecture
- **Smart Contracts**: Solidity on Ethereum/Polygon
- **Frontend**: Next.js with Web3 integration
- **IPFS**: Decentralized file storage
- **The Graph**: Indexing and querying blockchain data

## Revenue Model
- Minimal transaction fees (2-3%)
- Premium features for enhanced visibility
- Skill certification services`,
        category: IdeaCategory.BLOCKCHAIN,
        tags: ['Blockchain', 'DeFi', 'Smart Contracts', 'Freelancing', 'Web3'],
        status: IdeaStatus.PUBLISHED,
        authorId: users[2].id,
        voteScore: 32,
        viewCount: 200,
        commentCount: 12,
        publishedAt: new Date('2024-01-25T09:15:00Z'),
        aiTechStack: ['Solidity', 'Next.js', 'Web3.js', 'IPFS', 'The Graph'],
        aiComplexity: 'Advanced'
      }
    }),
    prisma.idea.create({
      data: {
        title: 'Real-time Collaborative Whiteboard',
        description: 'A web-based collaborative whiteboard with real-time synchronization and advanced drawing tools.',
        content: `# Real-time Collaborative Whiteboard

## Overview
Create a powerful, web-based collaborative whiteboard that enables teams to brainstorm, design, and collaborate in real-time.

## Features
- **Real-time Collaboration**: Multiple users can draw simultaneously
- **Advanced Drawing Tools**: Shapes, text, sticky notes, images
- **Infinite Canvas**: Zoom and pan across unlimited workspace
- **Version History**: Track changes and revert to previous versions
- **Templates**: Pre-built templates for different use cases
- **Export Options**: PDF, PNG, SVG export capabilities

## Technical Implementation
- **Frontend**: React with Canvas API or SVG
- **Real-time**: WebSocket connections for live updates
- **Backend**: Node.js with Socket.io
- **Database**: MongoDB for storing board data
- **File Storage**: AWS S3 for image uploads

## Use Cases
- Remote team brainstorming
- Design collaboration
- Educational purposes
- Project planning`,
        category: IdeaCategory.WEB,
        tags: ['Collaboration', 'Real-time', 'Canvas', 'WebSocket', 'Remote Work'],
        status: IdeaStatus.PUBLISHED,
        authorId: users[0].id,
        voteScore: 15,
        viewCount: 80,
        commentCount: 3,
        publishedAt: new Date('2024-02-01T16:45:00Z'),
        aiTechStack: ['React', 'Socket.io', 'Node.js', 'MongoDB', 'AWS S3'],
        aiComplexity: 'Intermediate'
      }
    })
  ]);

  console.log(`✅ Created ${ideas.length} ideas`);

  // Create some votes
  const votes = await Promise.all([
    // Votes for AI Code Review Assistant
    prisma.vote.create({
      data: { type: 'UP', userId: users[1].id, ideaId: ideas[0].id }
    }),
    prisma.vote.create({
      data: { type: 'UP', userId: users[2].id, ideaId: ideas[0].id }
    }),
    
    // Votes for Sustainable Habit Tracker
    prisma.vote.create({
      data: { type: 'UP', userId: users[0].id, ideaId: ideas[1].id }
    }),
    prisma.vote.create({
      data: { type: 'UP', userId: users[2].id, ideaId: ideas[1].id }
    }),
    
    // Votes for Decentralized Freelancer Marketplace
    prisma.vote.create({
      data: { type: 'UP', userId: users[0].id, ideaId: ideas[2].id }
    }),
    prisma.vote.create({
      data: { type: 'UP', userId: users[1].id, ideaId: ideas[2].id }
    })
  ]);

  console.log(`✅ Created ${votes.length} votes`);

  // Create some comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'This is a fantastic idea! I\'ve been looking for something like this for my team. The ML approach could really help catch issues we miss in manual reviews.',
        authorId: users[1].id,
        ideaId: ideas[0].id,
        voteScore: 5
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Have you considered integrating with existing CI/CD pipelines? That would make adoption much easier for development teams.',
        authorId: users[2].id,
        ideaId: ideas[0].id,
        voteScore: 3
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Love the environmental angle! Gamification is key to habit formation. Consider adding social features where friends can see each other\'s progress.',
        authorId: users[0].id,
        ideaId: ideas[1].id,
        voteScore: 4
      }
    }),
    prisma.comment.create({
      data: {
        content: 'The blockchain approach is interesting, but have you considered the gas fees? Maybe look into Layer 2 solutions like Polygon for lower costs.',
        authorId: users[0].id,
        ideaId: ideas[2].id,
        voteScore: 6
      }
    })
  ]);

  console.log(`✅ Created ${comments.length} comments`);

  // Create some follows
  const follows = await Promise.all([
    prisma.follow.create({
      data: { followerId: users[0].id, followingId: users[1].id }
    }),
    prisma.follow.create({
      data: { followerId: users[1].id, followingId: users[2].id }
    }),
    prisma.follow.create({
      data: { followerId: users[2].id, followingId: users[0].id }
    })
  ]);

  console.log(`✅ Created ${follows.length} follows`);

  // Create some bookmarks
  const bookmarks = await Promise.all([
    prisma.bookmark.create({
      data: { userId: users[1].id, ideaId: ideas[0].id }
    }),
    prisma.bookmark.create({
      data: { userId: users[0].id, ideaId: ideas[2].id }
    }),
    prisma.bookmark.create({
      data: { userId: users[2].id, ideaId: ideas[1].id }
    })
  ]);

  console.log(`✅ Created ${bookmarks.length} bookmarks`);

  // Create some activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        type: 'IDEA_PUBLISHED',
        userId: users[0].id,
        ideaId: ideas[0].id
      }
    }),
    prisma.activity.create({
      data: {
        type: 'IDEA_VOTED',
        userId: users[1].id,
        ideaId: ideas[0].id,
        data: { voteType: 'UP' }
      }
    }),
    prisma.activity.create({
      data: {
        type: 'COMMENT_CREATED',
        userId: users[1].id,
        ideaId: ideas[0].id,
        commentId: comments[0].id
      }
    })
  ]);

  console.log(`✅ Created ${activities.length} activities`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
