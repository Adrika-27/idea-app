import React, { useState, useEffect } from 'react';
import { recommendationsApi } from '../../api/discovery';
import IdeaCard from '../ideas/IdeaCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import type { Idea, TrendingResponse, IdeaCategory } from '../../types';

interface TrendingDashboardProps {
  className?: string;
}

export const TrendingDashboard: React.FC<TrendingDashboardProps> = ({ className = '' }) => {
  const [trendingData, setTrendingData] = useState<TrendingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | undefined>();

  const loadTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recommendationsApi.getTrending({
        period,
        category: selectedCategory,
        limit: 20
      });
      setTrendingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trending data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrending();
  }, [period, selectedCategory]);

  const periodLabels = {
    HOURLY: 'Last Hour',
    DAILY: 'Today',
    WEEKLY: 'This Week',
    MONTHLY: 'This Month'
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
          onClick={loadTrending}
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
            🔥 Trending Ideas
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Most popular ideas {periodLabels[period].toLowerCase()}
          </p>
        </div>
        
        {/* Period and Category Controls */}
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="HOURLY">Last Hour</option>
            <option value="DAILY">Today</option>
            <option value="WEEKLY">This Week</option>
            <option value="MONTHLY">This Month</option>
          </select>

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value as IdeaCategory || undefined)}
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

          <button
            onClick={loadTrending}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh trending data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Trending Topics */}
      {trendingData?.topics && trendingData.topics.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🏷️ Trending Topics
          </h3>
          <div className="flex flex-wrap gap-3">
            {trendingData.topics.slice(0, 10).map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-orange-200 dark:border-orange-800"
              >
                <span className="text-gray-900 dark:text-white font-medium">
                  {topic.name}
                </span>
                <span className="text-orange-600 dark:text-orange-400 text-sm font-semibold">
                  {topic.score.toFixed(1)}
                </span>
                {topic.mentionCount > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {topic.mentionCount} mentions
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Ideas Grid */}
      {trendingData?.ideas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            No trending ideas found for this period.
          </div>
          <button
            onClick={() => {
              setPeriod('WEEKLY');
              setSelectedCategory(undefined);
            }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Try a different time period
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trending Ideas
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {trendingData?.ideas.length} ideas
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trendingData?.ideas.map((idea: Idea, index) => (
              <div key={idea.id} className="relative">
                {/* Trending Rank Badge */}
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
                <IdeaCard idea={idea} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trendingData?.ideas.reduce((sum, idea) => sum + idea.voteScore, 0) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {trendingData?.ideas.reduce((sum, idea) => sum + idea.commentCount, 0) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {trendingData?.ideas.reduce((sum, idea) => sum + idea.viewCount, 0) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
          </div>
        </div>
      </div>
    </div>
  );
};