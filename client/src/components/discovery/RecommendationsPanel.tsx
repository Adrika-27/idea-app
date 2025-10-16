import React, { useState, useEffect } from 'react';
import { recommendationsApi } from '../../api/discovery';
import IdeaCard from '../ideas/IdeaCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { Idea, RecommendationResponse, IdeaCategory, DifficultyLevel, TimeCommitment } from '../../types';

interface RecommendationsProps {
  className?: string;
}

export const RecommendationsPanel: React.FC<RecommendationsProps> = ({ className = '' }) => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    category?: IdeaCategory;
    difficulty?: DifficultyLevel;
    timeCommitment?: TimeCommitment;
    limit?: number;
  }>({});

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recommendationsApi.getRecommendations(filters);
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [filters]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters({ ...filters, ...newFilters });
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={loadRecommendations}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recommended for You
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Ideas tailored to your interests and skills
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange({ 
              category: e.target.value as IdeaCategory || undefined 
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="WEB">Web Development</option>
            <option value="MOBILE">Mobile</option>
            <option value="AI_ML">AI/ML</option>
            <option value="BLOCKCHAIN">Blockchain</option>
            <option value="GAME_DEV">Game Development</option>
            <option value="DATA_SCIENCE">Data Science</option>
            <option value="CYBERSECURITY">Cybersecurity</option>
            <option value="DEVTOOLS">Dev Tools</option>
            <option value="FINTECH">FinTech</option>
            <option value="HEALTHTECH">HealthTech</option>
            <option value="EDTECH">EdTech</option>
            <option value="SOCIAL">Social</option>
            <option value="ECOMMERCE">E-commerce</option>
            <option value="PRODUCTIVITY">Productivity</option>
            <option value="OTHER">Other</option>
          </select>

          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange({ 
              difficulty: e.target.value as DifficultyLevel || undefined 
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Any Difficulty</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>

          <select
            value={filters.timeCommitment || ''}
            onChange={(e) => handleFilterChange({ 
              timeCommitment: e.target.value as TimeCommitment || undefined 
            })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Any Duration</option>
            <option value="QUICK">Quick (&lt; 1 week)</option>
            <option value="SHORT">Short (1-4 weeks)</option>
            <option value="MEDIUM">Medium (1-3 months)</option>
            <option value="LONG">Long (3-6 months)</option>
            <option value="EXTENDED">Extended (&gt; 6 months)</option>
          </select>

          <button
            onClick={loadRecommendations}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh recommendations"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Recommendation Criteria Display */}
      {recommendations?.criteria && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Recommendations based on:
          </h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {recommendations.criteria.categories?.map(category => (
              <span key={category} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">
                {category}
              </span>
            ))}
            {recommendations.criteria.techStack?.slice(0, 5).map(tech => (
              <span key={tech} className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded">
                {tech}
              </span>
            ))}
            {recommendations.criteria.techStack && recommendations.criteria.techStack.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                +{recommendations.criteria.techStack.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      {recommendations?.recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No recommendations found matching your criteria.
          </div>
          <button
            onClick={() => setFilters({})}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear filters to see more ideas
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations?.recommendations.map((idea: Idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {recommendations && recommendations.recommendations.length < recommendations.total && (
        <div className="text-center">
          <button
            onClick={() => handleFilterChange({ 
              limit: (filters.limit || 10) + 10 
            })}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
          >
            Load More ({recommendations.total - recommendations.recommendations.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
};