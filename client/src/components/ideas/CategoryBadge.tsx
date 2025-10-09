import { IdeaCategory } from '@/types';
import { cn } from '@/utils/cn';

interface CategoryBadgeProps {
  category: IdeaCategory;
  size?: 'sm' | 'md';
}

const CategoryBadge = ({ category, size = 'md' }: CategoryBadgeProps) => {
  const categoryConfig = {
    [IdeaCategory.WEB]: {
      label: 'Web App',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: '🌐',
    },
    [IdeaCategory.MOBILE]: {
      label: 'Mobile App',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      icon: '📱',
    },
    [IdeaCategory.AI_ML]: {
      label: 'AI/ML',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: '🤖',
    },
    [IdeaCategory.BLOCKCHAIN]: {
      label: 'Blockchain',
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      icon: '⛓️',
    },
    [IdeaCategory.IOT]: {
      label: 'IoT',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: '🔗',
    },
    [IdeaCategory.GAME_DEV]: {
      label: 'Game Dev',
      color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      icon: '🎮',
    },
    [IdeaCategory.DATA_SCIENCE]: {
      label: 'Data Science',
      color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      icon: '📊',
    },
    [IdeaCategory.CYBERSECURITY]: {
      label: 'Cybersecurity',
      color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      icon: '🔒',
    },
    [IdeaCategory.DEVTOOLS]: {
      label: 'Dev Tools',
      color: 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      icon: '🛠️',
    },
    [IdeaCategory.FINTECH]: {
      label: 'Fintech',
      color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      icon: '💰',
    },
    [IdeaCategory.HEALTHTECH]: {
      label: 'Health Tech',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: '🏥',
    },
    [IdeaCategory.EDTECH]: {
      label: 'Ed Tech',
      color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      icon: '📚',
    },
    [IdeaCategory.SOCIAL]: {
      label: 'Social',
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      icon: '👥',
    },
    [IdeaCategory.ECOMMERCE]: {
      label: 'E-commerce',
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: '🛒',
    },
    [IdeaCategory.PRODUCTIVITY]: {
      label: 'Productivity',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: '⚡',
    },
    [IdeaCategory.OTHER]: {
      label: 'Other',
      color: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700',
      icon: '✨',
    },
  };

  const config = categoryConfig[category];
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2 text-sm gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl font-semibold border shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md backdrop-blur-sm',
        config.color,
        sizeClasses[size]
      )}
    >
      <span className="text-base leading-none">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default CategoryBadge;
