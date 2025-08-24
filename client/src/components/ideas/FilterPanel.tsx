import { SearchFilters, IdeaCategory, IdeaStatus } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
}

const FilterPanel = ({ filters, onFilterChange, onReset }: FilterPanelProps) => {
  const categories = [
    { value: 'WEB', label: 'Web' },
    { value: 'MOBILE', label: 'Mobile' },
    { value: 'AI_ML', label: 'AI/ML' },
    { value: 'BLOCKCHAIN', label: 'Blockchain' },
    { value: 'IOT', label: 'IoT' },
    { value: 'GAME_DEV', label: 'Game Dev' },
    { value: 'DATA_SCIENCE', label: 'Data Science' },
    { value: 'CYBERSECURITY', label: 'Cybersecurity' },
    { value: 'DEVTOOLS', label: 'DevTools' },
    { value: 'FINTECH', label: 'Fintech' },
    { value: 'HEALTHTECH', label: 'Healthtech' },
    { value: 'EDTECH', label: 'Edtech' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'ECOMMERCE', label: 'E-commerce' },
    { value: 'PRODUCTIVITY', label: 'Productivity' },
    { value: 'OTHER', label: 'Other' },
  ];

  const statuses = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  const difficulties = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
  ];

  const hasActiveFilters = !!(
    filters.category ||
    filters.status ||
    filters.difficulty ||
    filters.tags?.length ||
    filters.minVotes ||
    filters.dateRange
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ 
              category: e.target.value as IdeaCategory || undefined 
            })}
            className="input w-full"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ 
              status: e.target.value as IdeaStatus || undefined 
            })}
            className="input w-full"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => onFilterChange({ 
              difficulty: (e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') || undefined 
            })}
            className="input w-full"
          >
            <option value="">All Levels</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Votes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Votes
          </label>
          <input
            type="number"
            min="0"
            value={filters.minVotes || ''}
            onChange={(e) => onFilterChange({ 
              minVotes: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            className="input w-full"
            placeholder="0"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={filters.tags?.join(', ') || ''}
          onChange={(e) => {
            const tags = e.target.value
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
            onFilterChange({ tags: tags.length > 0 ? tags : undefined });
          }}
          className="input w-full"
          placeholder="react, typescript, ai"
        />
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Range
        </label>
        <select
          value={filters.dateRange || ''}
          onChange={(e) => onFilterChange({ 
            dateRange: (e.target.value as 'week' | 'month' | 'year' | 'all') || undefined 
          })}
          className="input w-full max-w-xs"
        >
          <option value="">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
