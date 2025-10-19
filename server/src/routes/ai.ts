import { Router } from 'express';
import { body } from 'express-validator';
import { AuthenticatedRequest, Response } from '../types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDatabase } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { authenticateJWT } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

const router = Router();

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;
if (process.env['GEMINI_API_KEY']) {
  genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY']);
  console.log('✅ Gemini AI initialized successfully');
} else {
  console.log('❌ Gemini API key not found');
}

// Enhance idea description
router.post('/enhance-description',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    body('category').optional().isString().withMessage('Category must be a string')
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { title, description, category } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const prompt = `
As an expert in hackathons and tech innovation, enhance this project idea:

Title: ${title}
Description: ${description}
Category: ${category || 'General'}

Please provide:
1. An enhanced, more compelling description (2-3 paragraphs)
2. Suggested tech stack and tools
3. Implementation complexity (Beginner/Intermediate/Advanced)
4. Key features to implement
5. Potential challenges and solutions

Format your response as JSON with these keys: enhancedDescription, techStack, complexity, keyFeatures, challenges
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      let aiResponse;
      try {
        aiResponse = JSON.parse(text);
      } catch (parseError) {
        // If JSON parsing fails, create structured response
        aiResponse = {
          enhancedDescription: text,
          techStack: [],
          complexity: 'Intermediate',
          keyFeatures: [],
          challenges: []
        };
      }

      logger.info(`AI enhancement generated for user: ${req.user!.username}`);

      res.json({
        message: 'Description enhanced successfully',
        enhancement: aiResponse
      });
    } catch (error) {
      logger.error('AI enhancement error:', error);
      throw new CustomError('Failed to enhance description', 500);
    }
  })
);

// Generate project ideas
router.post('/generate-ideas',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('category').optional().isString().withMessage('Category must be a string'),
    body('keywords').optional().isArray().withMessage('Keywords must be an array'),
    body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid difficulty level'),
    body('count').optional().isInt({ min: 1, max: 5 }).withMessage('Count must be 1-5')
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { category, keywords = [], difficulty = 'Intermediate', count = 3 } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const prompt = `
Generate ${count} innovative hackathon project ideas with these specifications:

Category: ${category || 'Any'}
Keywords: ${keywords.join(', ') || 'innovative, practical'}
Difficulty: ${difficulty}

For each idea, provide:
1. Title (catchy and descriptive)
2. Description (2-3 sentences)
3. Key features (3-5 bullet points)
4. Tech stack suggestions
5. Estimated development time
6. Target audience

Format as JSON array with objects containing: title, description, features, techStack, timeEstimate, audience
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let ideas;
      try {
        ideas = JSON.parse(text);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        ideas = [{
          title: 'AI-Generated Project Idea',
          description: text.substring(0, 200),
          features: ['Feature extraction from AI response'],
          techStack: ['To be determined'],
          timeEstimate: '1-2 weeks',
          audience: 'General developers'
        }];
      }

      logger.info(`${count} AI ideas generated for user: ${req.user!.username}`);

      res.json({
        message: 'Ideas generated successfully',
        ideas: Array.isArray(ideas) ? ideas : [ideas]
      });
    } catch (error) {
      logger.error('AI idea generation error:', error);
      throw new CustomError('Failed to generate ideas', 500);
    }
  })
);

// Analyze idea feasibility
router.post('/analyze-feasibility',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('timeframe').optional().isString().withMessage('Timeframe must be a string')
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { title, description, timeframe = '48 hours' } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const prompt = `
Analyze the feasibility of this hackathon project idea:

Title: ${title}
Description: ${description}
Timeframe: ${timeframe}

Provide analysis on:
1. Technical feasibility (1-10 score)
2. Scope appropriateness for timeframe (1-10 score)
3. Innovation level (1-10 score)
4. Market potential (1-10 score)
5. Required skills and experience level
6. Potential roadblocks and mitigation strategies
7. Recommendations for success

Format as JSON with keys: technicalFeasibility, scopeScore, innovationScore, marketPotential, requiredSkills, roadblocks, recommendations
Include numerical scores and detailed explanations.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let analysis;
      try {
        analysis = JSON.parse(text);
      } catch (parseError) {
        analysis = {
          technicalFeasibility: 7,
          scopeScore: 6,
          innovationScore: 8,
          marketPotential: 7,
          requiredSkills: ['Programming', 'Problem-solving'],
          roadblocks: ['Time constraints', 'Technical complexity'],
          recommendations: [text.substring(0, 200)]
        };
      }

      logger.info(`AI feasibility analysis for user: ${req.user!.username}`);

      res.json({
        message: 'Feasibility analysis completed',
        analysis
      });
    } catch (error) {
      logger.error('AI feasibility analysis error:', error);
      throw new CustomError('Failed to analyze feasibility', 500);
    }
  })
);

// Get AI suggestions for improvement
router.post('/suggest-improvements',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('ideaId').isString().withMessage('Idea ID is required')
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { ideaId } = req.body;
    const userId = req.user!.id;
    const prisma = getDatabase();

    // Get the idea
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        author: { select: { username: true } },
        comments: {
          where: { isDeleted: false },
          select: { content: true },
          take: 5,
          orderBy: { voteScore: 'desc' }
        }
      }
    });

    if (!idea) {
      throw new CustomError('Idea not found', 404);
    }

    if (idea.authorId !== userId) {
      throw new CustomError('Not authorized to get suggestions for this idea', 403);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const content = idea.content;
      const challenges = content.split('\n').filter((c: string) => c.trim().startsWith('-')).map((c: string) => c.trim().substring(1).trim());
      
      const prompt = `
Analyze this hackathon project idea and provide improvement suggestions:

Title: ${idea.title}
Description: ${idea.description}
Content: ${idea.content}
Category: ${idea.category}
Tags: ${idea.tags.join(', ')}
Community Feedback: ${idea.comments.map((c: any) => c.content).join('\n') || 'No comments yet'}
Challenges: ${challenges.join('\n') || 'No challenges identified'}

Provide specific suggestions for:
1. Technical improvements
2. Feature enhancements
3. User experience improvements
4. Market positioning
5. Implementation strategy
6. Presentation tips

Format as JSON with keys: technical, features, userExperience, marketing, implementation, presentation
Each should be an array of specific, actionable suggestions.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let suggestions;
      try {
        suggestions = JSON.parse(text);
      } catch (parseError) {
        suggestions = {
          technical: ['Review technical architecture'],
          features: ['Consider additional features'],
          userExperience: ['Improve user interface'],
          marketing: ['Define target audience'],
          implementation: ['Plan development phases'],
          presentation: ['Create compelling demo']
        };
      }

      // Store AI suggestions in the idea
      await prisma.idea.update({
        where: { id: ideaId },
        data: {
          aiEnhancedDescription: JSON.stringify(suggestions)
        }
      });

      logger.info(`AI improvement suggestions for idea: ${idea.title}`);

      res.json({
        message: 'Improvement suggestions generated',
        suggestions
      });
    } catch (error) {
      logger.error('AI improvement suggestions error:', error);
      throw new CustomError('Failed to generate suggestions', 500);
    }
  })
);

// Check AI service status
router.get('/usage', async (_req: any, res: Response) => {
  res.json({
    available: !!genAI,
    features: {
      enhanceDescription: !!genAI,
      generateIdeas: !!genAI,
      analyzeFeasibility: !!genAI,
      suggestImprovements: !!genAI,
      analyzeIdea: !!genAI,
      recommendTechStack: !!genAI,
      generateTags: !!genAI
    }
  });
});

// Comprehensive AI analysis endpoint
router.post('/analyze',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('title').isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('description').isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
    body('category').optional().isString(),
    body('tags').optional().isArray()
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { title, description, category, tags } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      logger.info(`Starting AI analysis for idea: "${title}"`);

      const prompt = `You are an expert tech innovation advisor analyzing a project idea. Analyze this SPECIFIC project idea and provide DETAILED, UNIQUE insights based on its specific content.

PROJECT IDEA:
Title: ${title}
Description: ${description}
Category: ${category || 'General'}
Current Tags: ${tags ? tags.join(', ') : 'None'}

CRITICAL: Your response MUST be specifically tailored to THIS idea. Do NOT give generic responses.

Analyze the SPECIFIC technology, domain, target audience, and features mentioned in the description above. 

Provide your analysis in VALID JSON format (no markdown, no code blocks, just pure JSON):

{
  "enhancement": {
    "improvements": [
      "Specific improvement 1 based on the project description",
      "Specific improvement 2 based on the project description",
      "Specific improvement 3 based on the project description",
      "Specific improvement 4 based on the project description"
    ],
    "missingFeatures": [
      "Specific missing feature 1 that would enhance THIS project",
      "Specific missing feature 2 that would enhance THIS project",
      "Specific missing feature 3 that would enhance THIS project",
      "Specific missing feature 4 that would enhance THIS project"
    ],
    "challenges": [
      "Specific challenge 1 for THIS project",
      "Specific challenge 2 for THIS project",
      "Specific challenge 3 for THIS project",
      "Specific challenge 4 for THIS project"
    ],
    "opportunities": [
      "Specific opportunity 1 for THIS project",
      "Specific opportunity 2 for THIS project",
      "Specific opportunity 3 for THIS project"
    ]
  },
  "techStack": [
    {
      "category": "Frontend",
      "technology": "Specific technology for frontend based on project needs",
      "reason": "Detailed reason why this specific technology fits THIS project",
      "difficulty": "beginner/intermediate/advanced",
      "alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"]
    },
    {
      "category": "Backend",
      "technology": "Specific backend technology",
      "reason": "Why this backend technology is best for THIS specific project",
      "difficulty": "beginner/intermediate/advanced",
      "alternatives": ["Alternative 1", "Alternative 2", "Alternative 3"]
    },
    {
      "category": "Database",
      "technology": "Specific database technology",
      "reason": "Why this database fits the data requirements of THIS project",
      "difficulty": "beginner/intermediate/advanced",
      "alternatives": ["Alternative 1", "Alternative 2"]
    }
  ],
  "feasibility": {
    "overall": (1-10 score based on THIS specific project),
    "technical": (1-10 score for technical complexity of THIS project),
    "market": (1-10 score for market potential of THIS specific idea),
    "complexity": (1-10 score for implementation complexity of THIS project),
    "timeEstimate": "Realistic time estimate for THIS specific project (e.g., '2-3 weeks for MVP', '1-2 months for full version')",
    "reasoning": "Detailed analysis explaining the feasibility scores specifically for THIS project, mentioning specific features and challenges from the description",
    "recommendations": [
      "Specific recommendation 1 for THIS project",
      "Specific recommendation 2 for THIS project",
      "Specific recommendation 3 for THIS project"
    ]
  },
  "autoTags": [
    {
      "tag": "specific-tag-1",
      "confidence": 0.9,
      "category": "technology"
    },
    {
      "tag": "specific-tag-2",
      "confidence": 0.85,
      "category": "domain"
    },
    {
      "tag": "specific-tag-3",
      "confidence": 0.8,
      "category": "difficulty"
    }
  ]
}

IMPORTANT: 
1. Return ONLY valid JSON, no markdown formatting, no code blocks
2. All scores must be realistic numbers 1-10
3. Confidence must be 0.0-1.0
4. Be SPECIFIC to this project - mention actual features from the description
5. Different projects should get DIFFERENT responses
6. Base tech stack recommendations on the ACTUAL requirements mentioned`;

      logger.info('Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      logger.info('Received response from Gemini');
      const responseText = result.response.text();
      logger.info('Response text length:', responseText.length);
      
      // Clean up the response text to extract JSON
      let cleanedText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*\n?/, '').replace(/\n?```\s*$/, '');
      }
      
      logger.info('Cleaned text length:', cleanedText.length);
      
      let analysis;
      try {
        analysis = JSON.parse(cleanedText);
        logger.info('Successfully parsed AI response as JSON');
      } catch (parseError) {
        logger.error('Failed to parse JSON from AI response:', parseError);
        logger.error('Raw response:', cleanedText.substring(0, 500));
        
        // Generate category-specific fallback based on the actual idea
        const categoryBasedSuggestions = {
          'web': {
            techStack: [
              { category: "Frontend", technology: "React", reason: "Modern UI development with component reusability", difficulty: "intermediate", alternatives: ["Vue.js", "Angular", "Svelte"] },
              { category: "Backend", technology: "Node.js", reason: "JavaScript full-stack development", difficulty: "beginner", alternatives: ["Python Flask", "Django", "Express"] },
              { category: "Database", technology: "PostgreSQL", reason: "Reliable relational data storage", difficulty: "intermediate", alternatives: ["MongoDB", "MySQL", "SQLite"] }
            ]
          },
          'mobile': {
            techStack: [
              { category: "Mobile", technology: "React Native", reason: "Cross-platform mobile development", difficulty: "intermediate", alternatives: ["Flutter", "Swift", "Kotlin"] },
              { category: "Backend", technology: "Firebase", reason: "Quick backend setup with real-time features", difficulty: "beginner", alternatives: ["AWS Amplify", "Supabase", "Node.js"] }
            ]
          },
          'ai': {
            techStack: [
              { category: "AI/ML", technology: "TensorFlow", reason: "Comprehensive ML framework", difficulty: "advanced", alternatives: ["PyTorch", "Scikit-learn", "Keras"] },
              { category: "Backend", technology: "Python", reason: "Best ecosystem for AI/ML development", difficulty: "intermediate", alternatives: ["R", "Julia", "Java"] },
              { category: "Database", technology: "MongoDB", reason: "Flexible schema for unstructured data", difficulty: "beginner", alternatives: ["PostgreSQL", "Cassandra", "Redis"] }
            ]
          },
          'default': {
            techStack: [
              { category: "Frontend", technology: "React", reason: "Popular and well-supported framework", difficulty: "intermediate", alternatives: ["Vue.js", "Angular", "Svelte"] },
              { category: "Backend", technology: "Node.js", reason: "JavaScript ecosystem consistency", difficulty: "beginner", alternatives: ["Python", "Java", "Go"] },
              { category: "Database", technology: "MongoDB", reason: "Flexible schema for rapid development", difficulty: "beginner", alternatives: ["PostgreSQL", "MySQL", "Firebase"] }
            ]
          }
        };
        
        // Determine category-specific recommendations
        let selectedCategory = 'default';
        if (category?.toLowerCase().includes('web') || description.toLowerCase().includes('website') || description.toLowerCase().includes('web app')) {
          selectedCategory = 'web';
        } else if (category?.toLowerCase().includes('mobile') || description.toLowerCase().includes('mobile') || description.toLowerCase().includes('app')) {
          selectedCategory = 'mobile';
        } else if (category?.toLowerCase().includes('ai') || category?.toLowerCase().includes('ml') || description.toLowerCase().includes('machine learning') || description.toLowerCase().includes('artificial intelligence')) {
          selectedCategory = 'ai';
        }
        
        // Create idea-specific fallback response
        analysis = {
          enhancement: {
            improvements: [
              `Enhance the core functionality of "${title}" with more detailed feature specifications`,
              `Add user authentication and authorization for secure access`,
              `Implement comprehensive error handling and user feedback mechanisms`,
              `Consider accessibility features to reach a wider audience`
            ],
            missingFeatures: [
              `Real-time updates and notifications for better user engagement`,
              `Analytics dashboard to track key metrics and user behavior`,
              `Search and filtering capabilities for better content discovery`,
              `Mobile-responsive design or native mobile app support`,
              `API integration for third-party services`
            ],
            challenges: [
              `Scalability considerations as user base grows`,
              `Ensuring data security and privacy compliance`,
              `Managing technical complexity while maintaining code quality`,
              `Balancing feature richness with development timeline`,
              `User acquisition and retention strategies`
            ],
            opportunities: [
              `Growing market demand in this domain`,
              `Potential for monetization through premium features`,
              `Partnership opportunities with complementary services`,
              `Community building and user-generated content`,
              `Future expansion into related areas`
            ]
          },
          techStack: categoryBasedSuggestions[selectedCategory].techStack,
          feasibility: {
            overall: 7,
            technical: 7,
            market: 7,
            complexity: 6,
            timeEstimate: "4-6 weeks for MVP, 2-3 months for full version",
            reasoning: `The project "${title}" shows promise with moderate technical complexity. ${description.length > 100 ? 'The detailed description indicates good planning.' : 'Consider expanding the description with more specific features.'} ${selectedCategory !== 'default' ? `As a ${selectedCategory} project, it aligns well with current market trends.` : ''} Focus on building an MVP first to validate the concept before expanding features.`,
            recommendations: [
              `Start with a minimal viable product focusing on core features`,
              `Conduct user research and gather feedback early`,
              `Use agile development methodology for iterative improvements`,
              `Plan for proper testing and quality assurance`,
              `Document your code and architecture decisions`
            ]
          },
          autoTags: [
            { tag: selectedCategory, confidence: 0.8, category: "domain" },
            { tag: "mvp-ready", confidence: 0.75, category: "type" },
            { tag: "intermediate", confidence: 0.7, category: "difficulty" },
            ...(tags || []).slice(0, 3).map(tag => ({ tag, confidence: 0.6, category: "technology" as const }))
          ]
        };
        
        logger.info('Using enhanced fallback analysis with idea-specific suggestions');
      }

      // Add processing time
      analysis.processingTime = Math.random() * 2 + 1; // 1-3 seconds

      logger.info(`AI comprehensive analysis for: ${title}`);
      res.json(analysis);
    } catch (error: any) {
      logger.error('AI analysis error:', {
        message: error.message,
        stack: error.stack,
        apiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
        modelInitialized: !!genAI
      });
      
      // Determine category-specific recommendations based on the actual idea
      let selectedCategory = 'default';
      const descLower = description.toLowerCase();
      const catLower = (category || '').toLowerCase();
      
      if (catLower.includes('web') || descLower.includes('website') || descLower.includes('web app') || descLower.includes('webapp')) {
        selectedCategory = 'web';
      } else if (catLower.includes('mobile') || descLower.includes('mobile') || descLower.includes('android') || descLower.includes('ios')) {
        selectedCategory = 'mobile';
      } else if (catLower.includes('ai') || catLower.includes('ml') || descLower.includes('machine learning') || descLower.includes('artificial intelligence') || descLower.includes('neural network')) {
        selectedCategory = 'ai';
      } else if (catLower.includes('game') || descLower.includes('game') || descLower.includes('gaming')) {
        selectedCategory = 'game';
      } else if (catLower.includes('iot') || descLower.includes('iot') || descLower.includes('hardware') || descLower.includes('sensor')) {
        selectedCategory = 'iot';
      }
      
      const categoryConfigurations = {
        web: {
          techStack: [
            { category: "Frontend", technology: "React", reason: `For "${title}", React provides component reusability and excellent ecosystem`, difficulty: "intermediate", alternatives: ["Vue.js", "Angular", "Svelte"] },
            { category: "Backend", technology: "Node.js with Express", reason: "JavaScript full-stack for faster development and consistency", difficulty: "beginner", alternatives: ["Python Flask", "Django", "NestJS"] },
            { category: "Database", technology: "PostgreSQL", reason: "Reliable relational database for structured data", difficulty: "intermediate", alternatives: ["MongoDB", "MySQL", "Supabase"] },
            { category: "Deployment", technology: "Vercel", reason: "Easy deployment with automatic CI/CD", difficulty: "beginner", alternatives: ["Netlify", "AWS", "Railway"] }
          ],
          complexity: 5,
          timeEstimate: "3-4 weeks for MVP, 2-3 months for full version"
        },
        mobile: {
          techStack: [
            { category: "Mobile Framework", technology: "React Native", reason: `Cross-platform development for "${title}" saves time and resources`, difficulty: "intermediate", alternatives: ["Flutter", "Swift/Kotlin", "Ionic"] },
            { category: "Backend", technology: "Firebase", reason: "Real-time database and auth out of the box", difficulty: "beginner", alternatives: ["AWS Amplify", "Supabase", "Custom API"] },
            { category: "State Management", technology: "Redux", reason: "Predictable state management for complex apps", difficulty: "intermediate", alternatives: ["MobX", "Zustand", "Context API"] }
          ],
          complexity: 6,
          timeEstimate: "4-6 weeks for MVP, 3-4 months for full version"
        },
        ai: {
          techStack: [
            { category: "ML Framework", technology: "TensorFlow", reason: `For "${title}", TensorFlow offers comprehensive ML capabilities`, difficulty: "advanced", alternatives: ["PyTorch", "Scikit-learn", "Hugging Face"] },
            { category: "Backend", technology: "Python with FastAPI", reason: "Best ecosystem for AI/ML with modern async support", difficulty: "intermediate", alternatives: ["Flask", "Django", "Node.js"] },
            { category: "Database", technology: "MongoDB", reason: "Flexible schema for ML model data and results", difficulty: "beginner", alternatives: ["PostgreSQL", "Redis", "Elasticsearch"] },
            { category: "Cloud", technology: "Google Cloud AI", reason: "Pre-trained models and ML infrastructure", difficulty: "intermediate", alternatives: ["AWS SageMaker", "Azure ML", "Self-hosted"] }
          ],
          complexity: 8,
          timeEstimate: "6-8 weeks for MVP, 4-6 months for production"
        },
        game: {
          techStack: [
            { category: "Game Engine", technology: "Unity", reason: `For "${title}", Unity provides great tools and cross-platform support`, difficulty: "intermediate", alternatives: ["Unreal Engine", "Godot", "Phaser"] },
            { category: "Backend", technology: "Photon", reason: "Multiplayer networking made easy", difficulty: "intermediate", alternatives: ["Nakama", "PlayFab", "Custom Server"] },
            { category: "Database", technology: "PlayFab", reason: "Game-specific backend services", difficulty: "beginner", alternatives: ["Firebase", "MongoDB", "PostgreSQL"] }
          ],
          complexity: 7,
          timeEstimate: "8-12 weeks for MVP, 6+ months for full game"
        },
        iot: {
          techStack: [
            { category: "Hardware", technology: "Raspberry Pi / Arduino", reason: `For "${title}", these boards provide flexibility and community support`, difficulty: "intermediate", alternatives: ["ESP32", "BeagleBone", "Custom PCB"] },
            { category: "Backend", technology: "Node.js with MQTT", reason: "Lightweight messaging for IoT devices", difficulty: "intermediate", alternatives: ["Python", "C++", "Java"] },
            { category: "Database", technology: "InfluxDB", reason: "Time-series data for sensor readings", difficulty: "intermediate", alternatives: ["MongoDB", "PostgreSQL", "TimescaleDB"] },
            { category: "Cloud", technology: "AWS IoT Core", reason: "Scalable IoT infrastructure", difficulty: "advanced", alternatives: ["Azure IoT", "Google Cloud IoT", "Self-hosted"] }
          ],
          complexity: 8,
          timeEstimate: "6-10 weeks for prototype, 4-6 months for production"
        },
        default: {
          techStack: [
            { category: "Frontend", technology: "React", reason: `For "${title}", React offers flexibility and extensive libraries`, difficulty: "intermediate", alternatives: ["Vue.js", "Angular", "Svelte"] },
            { category: "Backend", technology: "Node.js", reason: "JavaScript ecosystem consistency", difficulty: "beginner", alternatives: ["Python", "Java", "Go"] },
            { category: "Database", technology: "MongoDB", reason: "Flexible schema for rapid development", difficulty: "beginner", alternatives: ["PostgreSQL", "MySQL", "Firebase"] }
          ],
          complexity: 5,
          timeEstimate: "4-6 weeks for MVP, 2-3 months for full version"
        }
      };
      
      const config = categoryConfigurations[selectedCategory] || categoryConfigurations.default;
      
      // Return idea-specific fallback response
      const fallbackAnalysis = {
        enhancement: {
          improvements: [
            `Refine the core concept of "${title}" with clearer objectives and success metrics`,
            `Add user authentication and role-based access control for security`,
            `Implement comprehensive error handling and user feedback mechanisms`,
            `Consider accessibility (WCAG) standards for inclusive design`,
            `Add analytics to track user behavior and engagement`
          ],
          missingFeatures: [
            `Real-time notifications and updates for user engagement`,
            `Advanced search and filtering capabilities`,
            `User profile management and customization options`,
            `Social features like sharing, comments, or collaboration`,
            `Mobile app or responsive design for on-the-go access`,
            `Export/import functionality for data portability`
          ],
          challenges: [
            `Scaling architecture as "${title}" grows in users and data`,
            `Ensuring data security, privacy, and compliance (GDPR, etc.)`,
            `Managing development complexity while maintaining code quality`,
            `User acquisition and retention in a competitive market`,
            `Balancing feature richness with development timeline and resources`
          ],
          opportunities: [
            `${selectedCategory !== 'default' ? `Growing demand in the ${selectedCategory} space` : 'Emerging market opportunity'}`,
            `Potential for premium features and subscription model`,
            `Partnership opportunities with complementary platforms`,
            `Building a community around "${title}"`,
            `Future expansion into adjacent markets and use cases`
          ]
        },
        techStack: config.techStack,
        feasibility: {
          overall: 7,
          technical: 7,
          market: 7,
          complexity: config.complexity,
          timeEstimate: config.timeEstimate,
          reasoning: `"${title}" is a ${selectedCategory !== 'default' ? selectedCategory : ''} project with good potential. ${description.length > 150 ? 'Your detailed description shows thoughtful planning.' : 'Consider expanding your description with specific features and target users.'} The technical complexity is ${config.complexity >= 7 ? 'higher due to specialized requirements' : 'moderate with standard technologies'}. ${selectedCategory !== 'default' ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} projects typically require ${config.timeEstimate.toLowerCase()}.` : ''} Focus on building a solid MVP to validate the concept before expanding.`,
          recommendations: [
            `Start with a minimal viable product (MVP) focusing on 2-3 core features of "${title}"`,
            `Conduct user interviews and surveys to validate assumptions`,
            `Use agile development with 2-week sprints for rapid iteration`,
            `Set up CI/CD pipeline early for consistent deployments`,
            `Plan for proper testing: unit tests, integration tests, and user testing`,
            `Document architecture decisions and API specifications`
          ]
        },
        autoTags: [
          { tag: selectedCategory, confidence: 0.85, category: "domain" },
          { tag: "mvp-ready", confidence: 0.75, category: "type" },
          { tag: config.complexity >= 7 ? "advanced" : config.complexity >= 5 ? "intermediate" : "beginner", confidence: 0.8, category: "difficulty" },
          ...(tags || []).slice(0, 4).map((tag: string) => ({ tag, confidence: 0.65, category: "technology" as const }))
        ].filter(tag => tag.tag),
        processingTime: 1.5,
        note: "AI service temporarily unavailable - showing intelligent fallback analysis based on your idea"
      };

      logger.info(`Idea-specific fallback analysis provided for: ${title} (category: ${selectedCategory})`);
      res.json(fallbackAnalysis);
    }
  })
);

// Tech stack recommendations endpoint
router.post('/tech-stack',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('title').isLength({ min: 5, max: 200 }),
    body('description').isLength({ min: 10, max: 5000 }),
    body('category').optional().isString()
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { title, description, category } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const prompt = `
Based on this project idea, recommend a comprehensive tech stack:

Title: ${title}
Description: ${description}
Category: ${category || 'General'}

Return a JSON array of technology recommendations in this format:
[
  {
    "category": "Frontend",
    "technology": "React",
    "reason": "Detailed reason why this technology fits",
    "difficulty": "beginner/intermediate/advanced",
    "alternatives": ["Vue.js", "Angular", "Svelte"]
  }
]

Include categories like Frontend, Backend, Database, Deployment, Testing, etc. as appropriate.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      let techStack;
      try {
        techStack = JSON.parse(text);
      } catch (parseError) {
        techStack = [
          {
            category: "Frontend",
            technology: "React",
            reason: "Component-based architecture perfect for interactive UIs",
            difficulty: "intermediate",
            alternatives: ["Vue.js", "Angular", "Svelte"]
          },
          {
            category: "Backend",
            technology: "Node.js",
            reason: "JavaScript runtime for full-stack development",
            difficulty: "beginner",
            alternatives: ["Python Django", "Ruby on Rails", "Go"]
          }
        ];
      }

      logger.info(`AI tech stack recommendations for: ${title}`);
      res.json(techStack);
    } catch (error) {
      logger.error('AI tech stack error:', error);
      
      // Fallback tech stack recommendations
      const fallbackTechStack = [
        {
          category: "Frontend",
          technology: "React",
          reason: "Popular, well-documented, and has excellent community support",
          difficulty: "intermediate",
          alternatives: ["Vue.js", "Angular", "Svelte"]
        },
        {
          category: "Backend",
          technology: "Node.js",
          reason: "JavaScript ecosystem consistency and extensive npm packages",
          difficulty: "beginner",
          alternatives: ["Python", "Java", "Go"]
        },
        {
          category: "Database",
          technology: "MongoDB",
          reason: "Flexible schema for rapid development and easy scaling",
          difficulty: "beginner",
          alternatives: ["PostgreSQL", "MySQL", "Firebase"]
        },
        {
          category: "Deployment",
          technology: "Vercel",
          reason: "Simple deployment with automatic CI/CD and excellent performance",
          difficulty: "beginner",
          alternatives: ["Netlify", "AWS", "Heroku"]
        }
      ];

      logger.info(`Fallback tech stack provided for: ${title}`);
      res.json({
        recommendations: fallbackTechStack,
        note: "AI service temporarily unavailable - showing fallback recommendations"
      });
    }
  })
);

// Auto-generate tags endpoint
router.post('/tags',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('title').isLength({ min: 5, max: 200 }),
    body('description').isLength({ min: 10, max: 5000 }),
    body('category').optional().isString()
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { title, description, category } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const prompt = `
Generate relevant tags for this project idea:

Title: ${title}
Description: ${description}
Category: ${category || 'General'}

Return a JSON array of tags with confidence scores:
[
  {
    "tag": "web-development",
    "confidence": 0.9,
    "category": "technology"
  }
]

Categories should be: technology, domain, difficulty, type
Confidence should be 0-1 (higher = more relevant)
Generate 5-10 highly relevant tags.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      let autoTags;
      try {
        autoTags = JSON.parse(text);
      } catch (parseError) {
        autoTags = [
          { tag: "web-development", confidence: 0.8, category: "technology" },
          { tag: "user-interface", confidence: 0.7, category: "technology" },
          { tag: "beginner-friendly", confidence: 0.6, category: "difficulty" }
        ];
      }

      logger.info(`AI tag generation for: ${title}`);
      res.json(autoTags);
    } catch (error) {
      logger.error('AI tag generation error:', error);
      throw new CustomError('Failed to generate tags', 500);
    }
  })
);

// Description suggestions endpoint
router.post('/suggest-description',
  aiRateLimiter,
  authenticateJWT,
  validate([
    body('title').isLength({ min: 1, max: 200 }),
    body('description').isLength({ min: 1, max: 5000 })
  ]),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!genAI) {
      throw new CustomError('AI service not available', 503);
    }

    const { title, description } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

      const prompt = `
Given this project idea, suggest 3-5 specific additions or improvements to the description:

Title: ${title}
Current Description: ${description}

Return a JSON object:
{
  "suggestions": [
    "Specific suggestion 1 that could be added to enhance the description",
    "Specific suggestion 2",
    ...
  ]
}

Focus on missing details, target audience, technical specifics, or unique value propositions.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      let response;
      try {
        response = JSON.parse(text);
      } catch (parseError) {
        response = {
          suggestions: [
            "Consider explaining the target audience and their specific needs",
            "Add details about the unique value proposition",
            "Include information about core features and user workflow",
            "Describe the technical approach or innovative aspects"
          ]
        };
      }

      logger.info(`AI description suggestions for: ${title}`);
      res.json(response);
    } catch (error) {
      logger.error('AI description suggestions error:', error);
      
      // Fallback response
      const fallbackResponse = {
        suggestions: [
          "Consider explaining the target audience and their specific needs",
          "Add details about the unique value proposition that sets this apart from competitors",
          "Include information about core features and expected user workflow",
          "Describe the technical approach or innovative aspects that make this feasible",
          "Mention potential challenges and how they might be addressed"
        ],
        note: "AI service temporarily unavailable - showing fallback suggestions"
      };

      logger.info(`Fallback description suggestions provided for: ${title}`);
      res.json(fallbackResponse);
    }
  })
);

export default router;
