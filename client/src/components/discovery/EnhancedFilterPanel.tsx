import React, { useState, useEffect } from 'react';
import { preferencesApi } from '../../api/discovery';
import type { 
  IdeaFilters, 
  IdeaCategory, 
  DifficultyLevel, 
  TimeCommitment,
  PreferencesOptions
} from '../../types';

interface EnhancedFilterPanelProps {
  filters: IdeaFilters;
  onFiltersChange: (filters: IdeaFilters) => void;
  className?: string;
}

export const EnhancedFilterPanel: React.FC<EnhancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [options, setOptions] = useState<PreferencesOptions | null>(null);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>(filters.techStack || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  const [customTech, setCustomTech] = useState('');
  const [customTag, setCustomTag] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await preferencesApi.getOptions();
        setOptions(data);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    loadOptions();
  }, []);

  const handleFilterChange = (key: keyof IdeaFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const addTechStack = (tech: string) => {
    if (tech && !selectedTechStack.includes(tech)) {
      const newTechStack = [...selectedTechStack, tech];
      setSelectedTechStack(newTechStack);
      handleFilterChange('techStack', newTechStack);
    }
  };

  const removeTechStack = (tech: string) => {
    const newTechStack = selectedTechStack.filter(t => t !== tech);
    setSelectedTechStack(newTechStack);
    handleFilterChange('techStack', newTechStack);
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      handleFilterChange('tags', newTags);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags);
  };

  const clearAllFilters = () => {
    setSelectedTechStack([]);
    setSelectedTags([]);
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => filters[key as keyof IdeaFilters]);

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value as IdeaCategory || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty Level
          </label>
          <select
            value={filters.difficulty || ''}
            onChange={(e) => handleFilterChange('difficulty', e.target.value as DifficultyLevel || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any Difficulty</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>

        {/* Time Commitment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Time Commitment
          </label>
          <select
            value={filters.timeCommitment || ''}
            onChange={(e) => handleFilterChange('timeCommitment', e.target.value as TimeCommitment || undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Any Duration</option>
            <option value="QUICK">Quick (&lt; 1 week)</option>
            <option value="SHORT">Short (1-4 weeks)</option>
            <option value="MEDIUM">Medium (1-3 months)</option>
            <option value="LONG">Long (3-6 months)</option>
            <option value="EXTENDED">Extended (&gt; 6 months)</option>
          </select>
        </div>

        {/* Tech Stack Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tech Stack
          </label>
          
          {/* Common Tech Stack Options */}
          {options?.commonTechStack && (
            <div className="mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular technologies:</div>
              <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto">
                {options.commonTechStack.slice(0, 20).map(tech => (
                  <button
                    key={tech}
                    onClick={() => addTechStack(tech)}
                    disabled={selectedTechStack.includes(tech)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      selectedTechStack.includes(tech)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Tech Stack Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add custom technology..."
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTechStack(customTech);
                  setCustomTech('');
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => {
                addTechStack(customTech);
                setCustomTech('');
              }}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Selected Tech Stack */}
          {selectedTechStack.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Selected technologies:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTechStack.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      onClick={() => removeTechStack(tech)}
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          
          {/* Custom Tag Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Add tag..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(customTag);
                  setCustomTag('');
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => {
                addTag(customTag);
                setCustomTag('');
              }}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Selected tags:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={filters.sort || 'hot'}
            onChange={(e) => handleFilterChange('sort', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="hot">🔥 Hot (Popular)</option>
            <option value="trending">📈 Trending</option>
            <option value="newest">🆕 Newest</option>
            <option value="oldest">📅 Oldest</option>
            <option value="popular">⭐ Most Popular</option>
          </select>
        </div>
      </div>
    </div>
  );
};