import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Idea } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  BookmarkIcon,
  EyeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import VoteButton from './VoteButton';
import CategoryBadge from './CategoryBadge';

interface IdeaCardProps {
  idea: Idea;
  showActions?: boolean;
}

const IdeaCard = ({ idea, showActions = true }: IdeaCardProps) => {
  const { isAuthenticated } = useAuthStore();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-neutral-900/10 dark:hover:shadow-black/25 hover:-translate-y-1 overflow-hidden">
      {/* Gradient overlay for premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            {idea.author.avatar ? (
              <img
                src={idea.author.avatar}
                alt={idea.author.username}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-neutral-200 dark:ring-neutral-700 group-hover:ring-primary-300 dark:group-hover:ring-primary-600 transition-all duration-300 shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                {idea.author.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  to={`/users/${idea.author.username}`}
                  className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 truncate"
                >
                  {idea.author.username}
                </Link>
                <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          {idea.category && (
            <div className="flex-shrink-0">
              <CategoryBadge category={idea.category} />
            </div>
          )}
        </div>

        {/* Title and Description */}
        <Link to={`/ideas/${idea.id}`} className="block group/content">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover/content:text-primary-600 dark:group-hover/content:text-primary-400 mb-3 transition-colors duration-200 line-clamp-2 leading-tight">
            {idea.title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 line-clamp-3 mb-4 leading-relaxed text-sm">
            {truncateText(idea.description, 150)}
          </p>
        </Link>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200 cursor-pointer"
              >
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="inline-flex items-center px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full text-xs font-medium">
                +{idea.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative px-6 py-4 bg-neutral-50/80 dark:bg-neutral-800/50 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 cursor-pointer group/stat">
              <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-sm group-hover/stat:shadow-md group-hover/stat:bg-primary-50 dark:group-hover/stat:bg-primary-900/30 transition-all duration-200">
                <HeartIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">{idea.voteScore}</span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 cursor-pointer group/stat">
              <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-sm group-hover/stat:shadow-md group-hover/stat:bg-primary-50 dark:group-hover/stat:bg-primary-900/30 transition-all duration-200">
                <ChatBubbleLeftIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">{idea.counts?.comments ?? idea._count?.comments ?? idea.commentCount ?? 0}</span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 cursor-pointer group/stat">
              <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 shadow-sm group-hover/stat:shadow-md group-hover/stat:bg-primary-50 dark:group-hover/stat:bg-primary-900/30 transition-all duration-200">
                <EyeIcon className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">{idea.views ?? 0}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && isAuthenticated && (
            <div className="flex items-center space-x-2">
              <VoteButton
                ideaId={idea.id}
                currentVote={idea.userVote ?? null}
                voteScore={idea.voteScore}
                size="sm"
              />
              
              <button
                className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm ${
                  idea.isBookmarked
                    ? 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                    : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
                title={idea.isBookmarked ? 'Remove bookmark' : 'Bookmark idea'}
              >
                {idea.isBookmarked ? (
                  <BookmarkIconSolid className="w-4 h-4" />
                ) : (
                  <BookmarkIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;
