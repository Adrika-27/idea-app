import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/api/ai';
import {
  SparklesIcon,
  LightBulbIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AISuggestionTooltipProps {
  title: string;
  description: string;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
}

const AISuggestionTooltip = ({
  title,
  description,
  onSuggestionSelect,
  className = ''
}: AISuggestionTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const suggestionMutation = useMutation({
    mutationFn: () => aiApi.suggestDescription(title, description),
    onSuccess: (data) => {
      setSuggestions(data);
    },
    onError: () => {
      setSuggestions([]);
    }
  });

  const handleGetSuggestions = () => {
    if (!title.trim() || !description.trim()) return;
    
    setIsOpen(true);
    if (suggestions.length === 0) {
      suggestionMutation.mutate();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleGetSuggestions}
        disabled={!title.trim() || !description.trim()}
        className="inline-flex items-center space-x-2 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Get AI suggestions"
      >
        <SparklesIcon className="w-4 h-4" />
        <span>AI Suggest</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center space-x-2">
              <LightBulbIcon className="w-5 h-5 text-yellow-500" />
              <h3 className="font-medium text-neutral-900 dark:text-white">AI Suggestions</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {suggestionMutation.isPending ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Generating suggestions...
                </span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                  Click on a suggestion to add it to your description:
                </p>
                {suggestions.map((suggestion, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-600 dark:text-neutral-400 text-sm">
                No suggestions available. Try providing more details in your description.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestionTooltip;