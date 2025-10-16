import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, AIAnalysisResponse, AIAnalysisRequest } from '@/api/ai';
import {
  SparklesIcon,
  LightBulbIcon,
  CpuChipIcon,
  ChartBarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface AIEnhancementPanelProps {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  onSuggestionsApplied?: (suggestions: {
    tags?: string[];
    description?: string;
    techStack?: string[];
  }) => void;
}

const AIEnhancementPanel = ({
  title,
  description,
  category,
  tags = [],
  onSuggestionsApplied
}: AIEnhancementPanelProps) => {
  const [activeTab, setActiveTab] = useState<'enhancement' | 'techstack' | 'feasibility' | 'tags'>('enhancement');
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);

  const analyzeIdeaMutation = useMutation({
    mutationFn: (request: AIAnalysisRequest) => aiApi.analyzeIdea(request),
    onSuccess: (data) => {
      setAnalysis(data);
      toast.success('AI analysis completed!');
    },
    onError: () => {
      toast.error('Failed to analyze idea. Please try again.');
    }
  });

  const handleAnalyzeIdea = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please provide both title and description');
      return;
    }

    analyzeIdeaMutation.mutate({
      title,
      description,
      category,
      tags
    });
  };

  const applyAutoTags = () => {
    if (analysis?.autoTags && onSuggestionsApplied) {
      const suggestedTags = analysis.autoTags
        .filter(tag => tag.confidence > 0.7)
        .map(tag => tag.tag);
      
      onSuggestionsApplied({ tags: [...tags, ...suggestedTags] });
      toast.success('Tags applied successfully!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'enhancement', label: 'Enhance Idea', icon: LightBulbIcon },
    { id: 'techstack', label: 'Tech Stack', icon: CpuChipIcon },
    { id: 'feasibility', label: 'Feasibility', icon: ChartBarIcon },
    { id: 'tags', label: 'Auto Tags', icon: TagIcon }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-white" />
            <h3 className="text-lg font-semibold text-white">AI-Powered Assistance</h3>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeIdea}
            disabled={analyzeIdeaMutation.isPending || !title.trim() || !description.trim()}
            className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50"
          >
            {analyzeIdeaMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4 mr-2" />
                Analyze Idea
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!analysis ? (
          <div className="text-center py-8">
            <SparklesIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Click "Analyze Idea" to get AI-powered suggestions and insights
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enhancement Tab */}
            {activeTab === 'enhancement' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-600" />
                    Suggested Improvements
                  </h4>
                  <ul className="space-y-2">
                    {analysis.enhancement.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
                    Missing Features
                  </h4>
                  <ul className="space-y-2">
                    {analysis.enhancement.missingFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <LightBulbIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-orange-600" />
                    Potential Challenges
                  </h4>
                  <ul className="space-y-2">
                    {analysis.enhancement.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tech Stack Tab */}
            {activeTab === 'techstack' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                  Recommended Technologies
                </h4>
                {analysis.techStack.map((tech, index) => (
                  <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-neutral-900 dark:text-white">{tech.category}</h5>
                        <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">{tech.technology}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tech.difficulty)}`}>
                        {tech.difficulty}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-3">{tech.reason}</p>
                    {tech.alternatives.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Alternatives: </span>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {tech.alternatives.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Feasibility Tab */}
            {activeTab === 'feasibility' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getFeasibilityColor(analysis.feasibility.overall)}`}>
                      {analysis.feasibility.overall}/10
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Overall</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getFeasibilityColor(analysis.feasibility.technical)}`}>
                      {analysis.feasibility.technical}/10
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Technical</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getFeasibilityColor(analysis.feasibility.market)}`}>
                      {analysis.feasibility.market}/10
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Market</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getFeasibilityColor(analysis.feasibility.complexity)}`}>
                      {analysis.feasibility.complexity}/10
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Complexity</div>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ClockIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400 mr-2" />
                    <span className="font-medium text-neutral-900 dark:text-white">Estimated Timeline</span>
                  </div>
                  <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                    {analysis.feasibility.timeEstimate}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">AI Analysis</h4>
                  <p className="text-neutral-700 dark:text-neutral-300 mb-4">{analysis.feasibility.reasoning}</p>
                  
                  <h5 className="font-medium text-neutral-900 dark:text-white mb-2">Recommendations</h5>
                  <ul className="space-y-2">
                    {analysis.feasibility.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tags Tab */}
            {activeTab === 'tags' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-neutral-900 dark:text-white">
                    AI-Generated Tags
                  </h4>
                  <button
                    type="button"
                    onClick={applyAutoTags}
                    className="btn btn-sm btn-primary"
                  >
                    Apply High-Confidence Tags
                  </button>
                </div>
                
                <div className="space-y-3">
                  {['technology', 'domain', 'difficulty', 'type'].map(category => {
                    const categoryTags = analysis.autoTags.filter(tag => tag.category === category);
                    if (categoryTags.length === 0) return null;
                    
                    return (
                      <div key={category}>
                        <h5 className="font-medium text-neutral-900 dark:text-white mb-2 capitalize">
                          {category} Tags
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {categoryTags.map((tag, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                tag.confidence > 0.8
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : tag.confidence > 0.6
                                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                  : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                              }`}
                            >
                              {tag.tag}
                              <span className="ml-2 text-xs opacity-75">
                                {Math.round(tag.confidence * 100)}%
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEnhancementPanel;