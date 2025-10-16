import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, FeasibilityScore } from '@/api/ai';
import {
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FeasibilityScoreDisplayProps {
  title: string;
  description: string;
  category?: string;
  className?: string;
  autoAnalyze?: boolean;
}

const FeasibilityScoreDisplay = ({
  title,
  description,
  category,
  className = '',
  autoAnalyze = false
}: FeasibilityScoreDisplayProps) => {
  const [score, setScore] = useState<FeasibilityScore | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const scoreMutation = useMutation({
    mutationFn: () => aiApi.scoreFeasibility({ title, description, category }),
    onSuccess: (data) => {
      setScore(data);
    }
  });

  const handleAnalyze = () => {
    if (!title.trim() || !description.trim()) return;
    scoreMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 4) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Highly Feasible';
    if (score >= 6) return 'Moderately Feasible';
    if (score >= 4) return 'Challenging';
    return 'High Risk';
  };

  // Auto-analyze if enabled and content is available
  useState(() => {
    if (autoAnalyze && title.trim() && description.trim() && !score && !scoreMutation.isPending) {
      const timeoutId = setTimeout(() => {
        handleAnalyze();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  });

  if (!score && !scoreMutation.isPending) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!title.trim() || !description.trim()}
          className="inline-flex items-center space-x-2 px-3 py-2 text-sm bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <ChartBarIcon className="w-4 h-4" />
          <span>Get Feasibility Score</span>
        </button>
      </div>
    );
  }

  if (scoreMutation.isPending) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          Analyzing feasibility...
        </span>
      </div>
    );
  }

  if (!score) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Score Display */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getScoreColor(score.overall)}`}>
          <ChartBarIcon className="w-5 h-5" />
          <div>
            <div className="font-bold text-lg">{score.overall}/10</div>
            <div className="text-xs">{getScoreLabel(score.overall)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-400">
          <ClockIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{score.timeEstimate}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Detailed Breakdown */}
      {showDetails && (
        <div className="space-y-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${score.technical >= 6 ? 'text-green-600' : score.technical >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score.technical}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Technical</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${score.market >= 6 ? 'text-green-600' : score.market >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score.market}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Market</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${score.complexity <= 5 ? 'text-green-600' : score.complexity <= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                {score.complexity}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Complexity</div>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-white mb-1">AI Analysis</h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{score.reasoning}</p>
              </div>
            </div>

            {/* Recommendations */}
            {score.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-neutral-900 dark:text-white flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-orange-600" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {score.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 pl-4 border-l-2 border-neutral-200 dark:border-neutral-700">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeasibilityScoreDisplay;