import apiClient from './client';

export interface IdeaEnhancement {
  improvements: string[];
  missingFeatures: string[];
  challenges: string[];
  opportunities: string[];
}

export interface TechStackRecommendation {
  category: string;
  technology: string;
  reason: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  alternatives: string[];
}

export interface FeasibilityScore {
  overall: number; // 1-10 scale
  technical: number;
  market: number;
  complexity: number;
  timeEstimate: string;
  reasoning: string;
  recommendations: string[];
}

export interface AutoTag {
  tag: string;
  confidence: number;
  category: 'technology' | 'domain' | 'difficulty' | 'type';
}

export interface AIAnalysisRequest {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

export interface AIAnalysisResponse {
  enhancement: IdeaEnhancement;
  techStack: TechStackRecommendation[];
  feasibility: FeasibilityScore;
  autoTags: AutoTag[];
  processingTime: number;
}

export const aiApi = {
  // Get AI analysis for an idea
  analyzeIdea: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    const response = await apiClient.post('/api/ai/analyze', request);
    return response.data;
  },

  // Get just idea enhancements
  enhanceIdea: async (request: AIAnalysisRequest): Promise<IdeaEnhancement> => {
    const response = await apiClient.post('/api/ai/enhance', request);
    return response.data;
  },

  // Get tech stack recommendations
  recommendTechStack: async (request: AIAnalysisRequest): Promise<TechStackRecommendation[]> => {
    const response = await apiClient.post('/api/ai/tech-stack', request);
    return response.data;
  },

  // Get feasibility score
  scoreFeasibility: async (request: AIAnalysisRequest): Promise<FeasibilityScore> => {
    const response = await apiClient.post('/api/ai/feasibility', request);
    return response.data;
  },

  // Get auto-generated tags
  generateTags: async (request: AIAnalysisRequest): Promise<AutoTag[]> => {
    const response = await apiClient.post('/api/ai/tags', request);
    return response.data;
  },

  // Get AI suggestions for improving idea description
  suggestDescription: async (title: string, currentDescription: string): Promise<string[]> => {
    const response = await apiClient.post('/api/ai/suggest-description', {
      title,
      description: currentDescription
    });
    return response.data.suggestions;
  },

  // Check if similar ideas exist
  findSimilarIdeas: async (request: AIAnalysisRequest): Promise<any[]> => {
    const response = await apiClient.post('/api/ai/similar', request);
    return response.data;
  }
};