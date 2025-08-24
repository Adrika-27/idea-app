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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {idea.author.avatar ? (
              <img
                src={idea.author.avatar}
                alt={idea.author.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {idea.author.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <Link
                to={`/users/${idea.author.username}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                {idea.author.username}
              </Link>
              <p className="text-sm text-gray-500">
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
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 mb-2 transition-colors">
            {idea.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {truncateText(idea.description, 150)}
          </p>
        </Link>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{idea.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <HeartIcon className="w-4 h-4" />
              <span>{idea.voteScore}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>{idea.counts?.comments ?? idea._count?.comments ?? idea.commentCount ?? 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="w-4 h-4" />
              <span>{idea.viewCount ?? idea.views ?? 0}</span>
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
                className={`p-2 rounded-md transition-colors ${
                  idea.isBookmarked
                    ? 'text-primary-600 hover:text-primary-700'
                    : 'text-gray-400 hover:text-gray-600'
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
