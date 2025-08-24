import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchApi } from '@/api/search';
import { ideasApi } from '@/api/ideas';
import { SearchFilters } from '@/types';
import { 
  MagnifyingGlassIcon, 
  ClockIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import IdeaCard from '@/components/ideas/IdeaCard';
import FilterPanel from '@/components/ideas/FilterPanel';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    limit: 12,
    sort: 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Get trending searches
  const { data: trendingSearches } = useQuery({
    queryKey: ['trending-searches'],
    queryFn: () => searchApi.getTrendingSearches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get popular searches
  const { data: popularSearches } = useQuery({
    queryKey: ['popular-searches'],
    queryFn: () => searchApi.getPopularSearches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Search ideas
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
  } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => {
      if (!query.trim()) {
        return ideasApi.getIdeas(filters);
      }
      return searchApi.searchIdeas(query, filters);
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get search suggestions
  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: () => searchApi.getSearchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== query) {
      setQuery(q);
    }
  }, [searchParams]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchParams({ q: searchQuery });
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'votes', label: 'Most Voted' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Ideas</h1>
          <p className="text-gray-600">
            Find the perfect hackathon or project idea for your next build
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for ideas, technologies, categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              className="input pl-10 w-full text-lg"
            />
            {query && (
              <button
                onClick={() => handleSearch(query)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-primary btn-sm"
              >
                Search
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {suggestions && suggestions.length > 0 && query.length >= 2 && (
            <div className="mt-4 border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!query ? (
          /* No Search Query - Show Trending and Popular */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending Searches */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <FireIcon className="w-5 h-5 text-red-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Trending Searches</h2>
              </div>
              <div className="space-y-2">
                {trendingSearches?.slice(0, 10).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <span className="text-sm text-gray-500 mr-2">#{index + 1}</span>
                    {search}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Searches */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <SparklesIcon className="w-5 h-5 text-purple-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Popular Searches</h2>
              </div>
              <div className="space-y-2">
                {popularSearches?.slice(0, 10).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <ClockIcon className="w-4 h-4 inline mr-2 text-gray-400" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            {/* Search Controls */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Search results for "{query}"
                  </h2>
                  {searchResults && (
                    <p className="text-sm text-gray-600">
                      {searchResults.pagination.total} results found
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange({ sort: e.target.value })}
                    className="input min-w-[150px]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Filters
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <FilterPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={() => setFilters({ page: 1, limit: 12, sort: 'relevance' })}
                  />
                </div>
              )}
            </div>

            {/* Results */}
            {searchLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchError ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">Failed to search ideas</div>
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            ) : searchResults?.ideas.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search terms or filters to find more ideas.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setQuery('');
                      setSearchParams({});
                      setFilters({ page: 1, limit: 12, sort: 'relevance' });
                    }}
                    className="btn btn-outline"
                  >
                    Clear Search
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-primary"
                  >
                    Adjust Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults?.ideas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
