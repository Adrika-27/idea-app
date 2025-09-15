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
    <div className="card card-interactive bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-900/10 transition-all duration-300">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            {idea.author.avatar ? (
              <img
                src={idea.author.avatar}
                alt={idea.author.username}
                className="avatar avatar-md object-cover ring-2 ring-transparent hover:ring-primary-200 transition-all duration-200"
              />
            ) : (
              <div className="avatar avatar-md bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold">
                {idea.author.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/users/${idea.author.username}`}
                  className="font-semibold text-neutral-900 hover:text-primary-600 transition-colors duration-200"
                >
                  {idea.author.username}
                </Link>
              </div>
              <p className="text-sm text-neutral-500">
                {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {idea.category && (
            <CategoryBadge category={idea.category} />
          )}
        </div>

        {/* Title and Description */}
        <Link to={`/ideas/${idea.id}`} className="block group">
          <h3 className="heading-3 group-hover:text-primary-600 mb-3 transition-colors duration-200 line-clamp-2">
            {idea.title}
          </h3>
          <p className="body-base text-neutral-600 line-clamp-3 mb-4">
            {truncateText(idea.description, 150)}
          </p>
        </Link>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="badge badge-secondary text-xs"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs text-neutral-500 font-medium">
                +{idea.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer bg-neutral-50/50 rounded-b-2xl">
        <div className="flex items-center justify-between w-full">
          {/* Stats */}
          <div className="flex items-center space-x-6 text-sm text-neutral-500">
            <div className="flex items-center space-x-1.5 hover:text-primary-600 transition-colors duration-200">
              <HeartIcon className="w-4 h-4" />
              <span className="font-medium">{idea.voteScore}</span>
            </div>
            <div className="flex items-center space-x-1.5 hover:text-primary-600 transition-colors duration-200">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="font-medium">{idea.counts?.comments ?? idea._count?.comments ?? idea.commentCount ?? 0}</span>
            </div>
            <div className="flex items-center space-x-1.5 hover:text-primary-600 transition-colors duration-200">
              <EyeIcon className="w-4 h-4" />
              <span className="font-medium">{idea.views ?? 0}</span>
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
                className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 ${
                  idea.isBookmarked
                    ? 'text-primary-600 hover:text-primary-700 bg-primary-50'
                    : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
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
