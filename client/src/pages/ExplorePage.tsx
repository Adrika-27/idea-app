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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Ideas</h1>
          <p className="text-gray-600">
            Discover amazing hackathon and project ideas from our community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </form>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ sort: e.target.value as SearchFilters['sort'] })}
                className="input min-w-[150px]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} flex items-center`}
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => setFilters({ page: 1, limit: 12, sort: 'popular' })}
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">Failed to load ideas</div>
              <button onClick={() => refetch()} className="btn btn-primary">
                Try Again
              </button>
            </div>
          ) : ideasData?.ideas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find more ideas.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ page: 1, limit: 12, sort: 'popular' });
                }}
                className="btn btn-outline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  Showing {ideasData?.ideas.length} of {ideasData?.pagination.total} ideas
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden btn btn-outline btn-sm"
                >
                  <AdjustmentsHorizontalIcon className="w-4 h-4 mr-1" />
                  Filters
                </button>
              </div>

              {/* Ideas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {ideasData?.ideas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>

              {/* Load More */}
              {(() => {
                const p = ideasData?.pagination;
                const hasNext = p ? p.page * p.limit < p.total : false;
                return hasNext;
              })() && (
                <div className="text-center">
                  <button
                    onClick={handleLoadMore}
                    className="btn btn-outline"
                  >
                    Load More Ideas
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
