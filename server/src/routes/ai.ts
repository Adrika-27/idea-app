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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
      suggestImprovements: !!genAI
    }
  });
});

export default router;
