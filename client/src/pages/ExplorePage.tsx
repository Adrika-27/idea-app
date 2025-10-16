import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ideasApi } from '@/api/ideas';
import { SearchFilters } from '@/types';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IdeaCard from '@/components/ideas/IdeaCard';
import FilterPanel from '@/components/ideas/FilterPanel';

const ExplorePage = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 12,
    sort: 'popular',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: ideasData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ideas', filters],
    queryFn: () => ideasApi.getIdeas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchQuery.trim() ? searchQuery.trim() : undefined,
      page: 1,
    }));
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  };

  const sortOptions: { value: SearchFilters['sort']; label: string }[] = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'trending', label: 'Trending' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-neutral-100/50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 dark:opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-200/20 dark:bg-neutral-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neutral-200/20 dark:bg-neutral-800/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
              Explore Amazing 
              <span className="block text-primary-600 dark:text-primary-400">Ideas</span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Discover innovative hackathon and project ideas from our global community of creators
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search and Filters Card */}
        <div className="glass-card rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search for innovative ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-12 pr-4 h-12 w-full text-base bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500/20 shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary btn-sm px-4"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Enhanced Controls */}
            <div className="flex items-center gap-3">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value as SearchFilters['sort'] })}
                className="input h-12 min-w-[160px] bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm ${
                  showFilters 
                    ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/25' 
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Enhanced Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => setFilters({ page: 1, limit: 12, sort: 'popular' })}
              />
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mb-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="xl" />
              <p className="text-neutral-600 dark:text-neutral-400 mt-4 text-lg">Loading amazing ideas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Something went wrong</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">Failed to load ideas. Please try again.</p>
              <button onClick={() => refetch()} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : ideasData?.ideas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">No ideas found</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                We couldn't find any ideas matching your criteria. Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ page: 1, limit: 12, sort: 'popular' });
                }}
                className="btn btn-outline"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {ideasData?.ideas.length} Ideas Found
                  </h2>
                  <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                    {ideasData?.pagination.total} total
                  </div>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn btn-outline btn-sm"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>

              {/* Enhanced Ideas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {ideasData?.ideas.map((idea, index) => (
                  <div 
                    key={idea.id} 
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <IdeaCard idea={idea} />
                  </div>
                ))}
              </div>

              {/* Enhanced Load More */}
              {(() => {
                const p = ideasData?.pagination;
                const hasNext = p ? p.page * p.limit < p.total : false;
                return hasNext;
              })() && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-primary btn-lg shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
                  >
                    Load More Ideas
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
