// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  socialLinks?: Record<string, string>;
  karmaScore: number;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    ideas: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
  isOwnProfile?: boolean;
}

// Idea types
export interface Idea {
  id: string;
  title: string;
  description: string;
  content: string;
  category: IdeaCategory;
  tags: string[];
  status: IdeaStatus;
  authorId: string;
  author: Pick<User, 'id' | 'username' | 'avatar' | 'karmaScore'>;
  voteScore: number;
  viewCount: number;
  views?: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  aiEnhancedDescription?: string;
  aiTechStack: string[];
  techStack?: string[];
  aiComplexity?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedTime?: string;
  images: string[];
  userVote?: VoteType | null;
  isBookmarked?: boolean;
  counts?: {
    votes: number;
    comments: number;
    bookmarks: number;
  };
  _count?: {
    votes: number;
    comments: number;
    bookmarks: number;
  };
}

export enum IdeaCategory {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  AI_ML = 'AI_ML',
  BLOCKCHAIN = 'BLOCKCHAIN',
  IOT = 'IOT',
  GAME_DEV = 'GAME_DEV',
  DATA_SCIENCE = 'DATA_SCIENCE',
  CYBERSECURITY = 'CYBERSECURITY',
  DEVTOOLS = 'DEVTOOLS',
  FINTECH = 'FINTECH',
  HEALTHTECH = 'HEALTHTECH',
  EDTECH = 'EDTECH',
  SOCIAL = 'SOCIAL',
  ECOMMERCE = 'ECOMMERCE',
  PRODUCTIVITY = 'PRODUCTIVITY',
  OTHER = 'OTHER',
}

export enum IdeaStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
}

// Comment types
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: Pick<User, 'id' | 'username' | 'avatar' | 'karmaScore'>;
  ideaId: string;
  parentCommentId?: string;
  voteScore: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userVote?: VoteType | null;
  replies?: Comment[];
  replyCount?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId: string;
  isRead: boolean;
  createdAt: string;
}

export enum NotificationType {
  VOTE = 'VOTE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  IDEA_PUBLISHED = 'IDEA_PUBLISHED',
  IDEA_FEATURED = 'IDEA_FEATURED',
  SYSTEM = 'SYSTEM',
}

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: boolean;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IdeasResponse extends PaginatedResponse<Idea> {
  ideas: Idea[];
  filters?: {
    category?: IdeaCategory;
    tags?: string[];
    search?: string;
    sort?: string;
  };
}

export interface CommentsResponse extends PaginatedResponse<Comment> {
  comments: Comment[];
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser extends User {
  tokens?: AuthTokens;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

// Search types
export interface SearchFilters {
  // Client previously used 'query'; server expects 'search'. Support both.
  query?: string;
  search?: string;
  category?: IdeaCategory;
  tags?: string[];
  author?: string;
  sort?: 'relevance' | 'newest' | 'oldest' | 'popular' | 'trending';
  page?: number;
  limit?: number;
  status?: IdeaStatus;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  minVotes?: number;
  dateRange?: 'week' | 'month' | 'year' | 'all';
}

export interface SearchSuggestions {
  titles: string[];
  tags: string[];
  authors: Pick<User, 'username' | 'avatar' | 'karmaScore'>[];
}

// AI types
export interface AIEnhancement {
  enhancedDescription: string;
  techStack: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  keyFeatures: string[];
  challenges: string[];
}

export interface AIIdeaGeneration {
  title: string;
  description: string;
  features: string[];
  techStack: string[];
  timeEstimate: string;
  audience: string;
}

export interface AIFeasibilityAnalysis {
  technicalFeasibility: number;
  scopeScore: number;
  innovationScore: number;
  marketPotential: number;
  requiredSkills: string[];
  roadblocks: string[];
  recommendations: string[];
}

// Socket types
export interface SocketEvents {
  'vote:updated': {
    ideaId: string;
    voteScore: number;
    userVote: VoteType | null;
  };
  'comment:added': {
    ideaId: string;
    comment: Comment;
  };
  'comment:vote_updated': { 
    ideaId: string; 
    commentId: string; 
    voteScore: number; 
    userVote: 'UP' | 'DOWN' | null 
  };
  'user:typing': {
    userId: string;
    username: string;
    ideaId: string;
  };
  'user:stopped_typing': {
    userId: string;
    ideaId: string;
  };
  'user:online': {
    userId: string;
    username: string;
  };
  'user:offline': {
    userId: string;
    username: string;
  };
  'notification:new': Notification;
  'idea:new': { 
    idea: Idea 
  };
}

// Form types
export interface IdeaFormData {
  title: string;
  description: string;
  content: string;
  category: IdeaCategory;
  tags: string[];
  images?: string[];
  status?: IdeaStatus;
}

export interface ProfileFormData {
  bio?: string;
  skills?: string[];
  socialLinks?: Record<string, string>;
  avatar?: string;
}

export interface CommentFormData {
  content: string;
  parentId?: string;
  parentCommentId?: string;
}

// Dashboard types
export interface DashboardStats {
  ideas: {
    published: number;
    draft: number;
    archived: number;
  };
  engagement: {
    upvotes: number;
    comments: number;
    followers: number;
  };
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  ideaId?: string;
  commentId?: string;
  data?: Record<string, any>;
  createdAt: string;
  idea?: Pick<Idea, 'id' | 'title'>;
  comment?: Pick<Comment, 'id' | 'content'>;
}

export enum ActivityType {
  IDEA_CREATED = 'IDEA_CREATED',
  IDEA_UPDATED = 'IDEA_UPDATED',
  IDEA_PUBLISHED = 'IDEA_PUBLISHED',
  IDEA_VOTED = 'IDEA_VOTED',
  COMMENT_CREATED = 'COMMENT_CREATED',
  COMMENT_VOTED = 'COMMENT_VOTED',
  USER_FOLLOWED = 'USER_FOLLOWED',
  BOOKMARK_ADDED = 'BOOKMARK_ADDED',
}

// Upload types
export interface UploadResponse {
  message: string;
  avatarUrl?: string;
  images?: string[];
}

export interface UploadLimits {
  maxFileSize: number;
  maxFiles: number;
  allowedTypes: string[];
}

// Error types
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}
