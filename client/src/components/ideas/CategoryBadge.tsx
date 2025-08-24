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
      color: 'bg-blue-100 text-blue-800',
    },
    [IdeaCategory.MOBILE]: {
      label: 'Mobile App',
      color: 'bg-green-100 text-green-800',
    },
    [IdeaCategory.AI_ML]: {
      label: 'AI/ML',
      color: 'bg-purple-100 text-purple-800',
    },
    [IdeaCategory.BLOCKCHAIN]: {
      label: 'Blockchain',
      color: 'bg-yellow-100 text-yellow-800',
    },
    [IdeaCategory.IOT]: {
      label: 'IoT',
      color: 'bg-red-100 text-red-800',
    },
    [IdeaCategory.GAME_DEV]: {
      label: 'Game Dev',
      color: 'bg-pink-100 text-pink-800',
    },
    [IdeaCategory.DATA_SCIENCE]: {
      label: 'Data Science',
      color: 'bg-violet-100 text-violet-800',
    },
    [IdeaCategory.CYBERSECURITY]: {
      label: 'Cybersecurity',
      color: 'bg-red-100 text-red-800',
    },
    [IdeaCategory.DEVTOOLS]: {
      label: 'Dev Tools',
      color: 'bg-slate-100 text-slate-800',
    },
    [IdeaCategory.FINTECH]: {
      label: 'Fintech',
      color: 'bg-cyan-100 text-cyan-800',
    },
    [IdeaCategory.HEALTHTECH]: {
      label: 'Health Tech',
      color: 'bg-emerald-100 text-emerald-800',
    },
    [IdeaCategory.EDTECH]: {
      label: 'Ed Tech',
      color: 'bg-teal-100 text-teal-800',
    },
    [IdeaCategory.SOCIAL]: {
      label: 'Social',
      color: 'bg-orange-100 text-orange-800',
    },
    [IdeaCategory.ECOMMERCE]: {
      label: 'E-commerce',
      color: 'bg-amber-100 text-amber-800',
    },
    [IdeaCategory.PRODUCTIVITY]: {
      label: 'Productivity',
      color: 'bg-indigo-100 text-indigo-800',
    },
    [IdeaCategory.OTHER]: {
      label: 'Other',
      color: 'bg-gray-100 text-gray-800',
    },
  };

  const config = categoryConfig[category];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.color,
        sizeClasses[size]
      )}
    >
      {config.label}
    </span>
  );
};

export default CategoryBadge;
