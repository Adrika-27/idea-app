import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RecommendationsPanel } from '../components/discovery/RecommendationsPanel';
import { TrendingDashboard } from '../components/discovery/TrendingDashboard';
import { EnhancedFilterPanel } from '../components/discovery/EnhancedFilterPanel';
import { enhancedIdeasApi } from '../api/discovery';
import IdeaCard from '../components/ideas/IdeaCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuthStore } from '../store/authStore';
import type { Idea, IdeaFilters, PaginatedResponse } from '../types';

const DiscoveryPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('discover');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IdeaFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const loadIdeas = async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 1 : pagination.page;
      const response: PaginatedResponse<Idea> = await enhancedIdeasApi.getIdeas({
        ...filters,
        page: currentPage,
        limit: pagination.limit
      });

      if (resetPage) {
        setIdeas(response.data);
        setPagination({
          ...pagination,
          page: 1,
          total: response.pagination.total,
          pages: response.pagination.pages
        });
      } else {
        setIdeas(prev => [...prev, ...response.data]);
        setPagination(prev => ({
          ...prev,
          page: currentPage,
          total: response.pagination.total,
          pages: response.pagination.pages
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'discover') {
      loadIdeas(true);
    }
  }, [filters, activeTab]);

  const handleFiltersChange = (newFilters: IdeaFilters) => {
    setFilters(newFilters);
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages && !loading) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      loadIdeas();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Ideas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your next project with AI-powered recommendations and trending insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Discover
            </TabsTrigger>
            
            {user && (
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                For You
              </TabsTrigger>
            )}
            
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trending
            </TabsTrigger>
            
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Collections
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <EnhancedFilterPanel
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                />
              </div>

              {/* Ideas Grid */}
              <div className="lg:col-span-3">
                {loading && ideas.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                    <button
                      onClick={() => loadIdeas(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Results Header */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {pagination.total > 0 ? (
                          <>Showing {ideas.length} of {pagination.total} ideas</>
                        ) : (
                          'No ideas found'
                        )}
                      </div>
                      
                      {Object.keys(filters).length > 0 && (
                        <button
                          onClick={() => setFilters({})}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>

                    {/* Ideas Grid */}
                    {ideas.length > 0 ? (
                      <>
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {ideas.map((idea) => (
                            <IdeaCard key={idea.id} idea={idea} />
                          ))}
                        </div>

                        {/* Load More */}
                        {pagination.page < pagination.pages && (
                          <div className="text-center py-6">
                            <button
                              onClick={loadMore}
                              disabled={loading}
                              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50"
                            >
                              {loading ? 'Loading...' : `Load More (${pagination.total - ideas.length} remaining)`}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400 mb-4">
                          No ideas match your current filters.
                        </div>
                        <button
                          onClick={() => setFilters({})}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear filters to see all ideas
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          {user && (
            <TabsContent value="recommendations" className="mt-6">
              <RecommendationsPanel />
            </TabsContent>
          )}

          {/* Trending Tab */}
          <TabsContent value="trending" className="mt-6">
            <TrendingDashboard />
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="mt-6">
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                Collections feature coming soon!
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Save ideas to custom collections and discover curated lists from the community.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DiscoveryPage;