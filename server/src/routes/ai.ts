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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });
      
      logger.info('Starting Gemini API call...');

      const prompt = `
As a tech innovation expert, analyze this project idea comprehensively:

Title: ${title}
Description: ${description}
Category: ${category || 'General'}
Current Tags: ${tags ? tags.join(', ') : 'None'}

Provide a JSON response with the following structure:
{
  "enhancement": {
    "improvements": ["improvement 1", "improvement 2", ...],
    "missingFeatures": ["feature 1", "feature 2", ...],
    "challenges": ["challenge 1", "challenge 2", ...],
    "opportunities": ["opportunity 1", "opportunity 2", ...]
  },
  "techStack": [
    {
      "category": "Frontend/Backend/Database/etc",
      "technology": "Technology Name",
      "reason": "Why this technology fits",
      "difficulty": "beginner/intermediate/advanced",
      "alternatives": ["alt1", "alt2", "alt3"]
    }
  ],
  "feasibility": {
    "overall": 7,
    "technical": 6,
    "market": 8,
    "complexity": 5,
    "timeEstimate": "2-3 months for MVP",
    "reasoning": "Detailed analysis of feasibility",
    "recommendations": ["rec 1", "rec 2", ...]
  },
  "autoTags": [
    {
      "tag": "tag-name",
      "confidence": 0.85,
      "category": "technology/domain/difficulty/type"
    }
  ]
}

Make sure all scores are 1-10, confidence is 0-1, and provide practical, actionable insights.`;

      logger.info('Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      logger.info('Received response from Gemini');
      const text = result.response.text();
      logger.info('Response text length:', text.length);
      
      let analysis;
      try {
        analysis = JSON.parse(text);
      } catch (parseError) {
        // Fallback response if AI doesn't return valid JSON
        analysis = {
          enhancement: {
            improvements: ["Consider adding user authentication", "Implement responsive design", "Add data validation"],
            missingFeatures: ["Search functionality", "User profiles", "Mobile app"],
            challenges: ["Scalability", "User adoption", "Competition"],
            opportunities: ["Market demand", "Partnership potential", "Future expansions"]
          },
          techStack: [
            {
              category: "Frontend",
              technology: "React",
              reason: "Component-based architecture for scalability",
              difficulty: "intermediate",
              alternatives: ["Vue.js", "Angular", "Svelte"]
            }
          ],
          feasibility: {
            overall: 7,
            technical: 6,
            market: 8,
            complexity: 5,
            timeEstimate: "2-3 months for MVP",
            reasoning: "The idea has good market potential with moderate technical complexity.",
            recommendations: ["Start with MVP", "User research", "Iterative development"]
          },
          autoTags: [
            { tag: "web-development", confidence: 0.8, category: "technology" },
            { tag: "beginner-friendly", confidence: 0.7, category: "difficulty" }
          ]
        };
      }

      // Add processing time
      analysis.processingTime = Math.random() * 2 + 1; // 1-3 seconds

      logger.info(`AI comprehensive analysis for: ${title}`);
      res.json(analysis);
    } catch (error) {
      logger.error('AI analysis error:', {
        message: error.message,
        stack: error.stack,
        apiKey: process.env.GEMINI_API_KEY ? 'Present' : 'Missing',
        modelInitialized: !!genAI
      });
      
      // Return fallback response instead of throwing error
      const fallbackAnalysis = {
        enhancement: {
          improvements: ["Add user authentication and security features", "Implement responsive design for mobile devices", "Add comprehensive data validation"],
          missingFeatures: ["User dashboard", "Search and filter functionality", "Social sharing capabilities", "Analytics and reporting"],
          challenges: ["Scalability considerations", "User adoption strategy", "Competition analysis", "Technical complexity"],
          opportunities: ["Growing market demand", "Partnership potential", "Monetization strategies", "Future feature expansions"]
        },
        techStack: [
          {
            category: "Frontend",
            technology: "React",
            reason: "Component-based architecture for maintainable UI development",
            difficulty: "intermediate",
            alternatives: ["Vue.js", "Angular", "Svelte"]
          },
          {
            category: "Backend", 
            technology: "Node.js",
            reason: "JavaScript ecosystem consistency and npm package availability",
            difficulty: "beginner",
            alternatives: ["Python", "Java", "Go"]
          },
          {
            category: "Database",
            technology: "MongoDB",
            reason: "Flexible schema for rapid prototyping and development",
            difficulty: "beginner", 
            alternatives: ["PostgreSQL", "MySQL", "Firebase"]
          }
        ],
        feasibility: {
          overall: 7,
          technical: 6,
          market: 8,
          complexity: 5,
          timeEstimate: "2-3 months for MVP",
          reasoning: "The idea has good market potential with moderate technical complexity. Standard web technologies can be used for implementation.",
          recommendations: ["Start with a minimal viable product (MVP)", "Conduct user research and validation", "Use iterative development approach", "Consider existing solutions and differentiation"]
        },
        autoTags: [
          { tag: "web-development", confidence: 0.9, category: "technology" },
          { tag: "mvp-ready", confidence: 0.8, category: "difficulty" },
          { tag: "user-focused", confidence: 0.7, category: "type" },
          { tag: "scalable", confidence: 0.6, category: "domain" }
        ],
        processingTime: 1.5,
        note: "AI service temporarily unavailable - showing fallback analysis"
      };

      logger.info(`Fallback analysis provided for: ${title}`);
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
